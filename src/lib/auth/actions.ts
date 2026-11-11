"use server";

import { redirect } from "next/navigation";
import {
  getSafeAdminPath,
  isValidAdminEmail,
  maximumAuthFieldLength,
  normalizeAdminEmail,
  readFormString,
  validateNewAdminPassword,
  type AuthFieldErrors,
} from "./policy";
import type { AuthActionState } from "./state";
import { getAuthSiteUrl } from "./site-url";
import { getCurrentAdmin } from "./guard";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";
import { SupabaseConfigurationError } from "@/lib/supabase/config";

const genericSignInError =
  "We could not sign you in with those details. Check them and try again.";

function isAuthConfigurationFailure(error: unknown): boolean {
  if (error instanceof SupabaseConfigurationError) {
    return true;
  }

  if (error instanceof TypeError) {
    console.error("Admin authentication request could not reach its service.");
    return true;
  }

  return false;
}

export async function signInAdmin(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeAdminEmail(readFormString(formData, "email"));
  const password = readFormString(formData, "password");
  const fieldErrors: AuthFieldErrors = {};

  if (!isValidAdminEmail(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (!password || password.length > maximumAuthFieldLength) {
    fieldErrors.password = "Enter your password.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "", fieldErrors };
  }

  let supabase: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;
  let signInError: { code?: string } | null;

  try {
    supabase = await createSupabaseAuthServerClient();
    const response = await supabase.auth.signInWithPassword({ email, password });
    signInError = response.error;
  } catch (error) {
    if (!isAuthConfigurationFailure(error)) {
      throw error;
    }

    console.error("Admin sign-in configuration or service is unavailable.");
    return {
      status: "error",
      message: "Admin sign-in is temporarily unavailable. Try again later.",
      fieldErrors: {},
    };
  }

  if (signInError) {
    return { status: "error", message: genericSignInError, fieldErrors: {} };
  }

  let admin: Awaited<ReturnType<typeof getCurrentAdmin>>;
  try {
    admin = await getCurrentAdmin();
  } catch (error) {
    if (!isAuthConfigurationFailure(error)) {
      throw error;
    }

    const { error: cleanupError } = await supabase.auth.signOut({
      scope: "local",
    });
    if (cleanupError) {
      console.error(
        `Admin sign-in session cleanup failed: ${cleanupError.code ?? "unknown"}.`,
      );
    }
    console.error("Admin role verification is temporarily unavailable.");
    return {
      status: "error",
      message: "Admin sign-in is temporarily unavailable. Try again later.",
      fieldErrors: {},
    };
  }

  if (!admin) {
    const { error: signOutError } = await supabase.auth.signOut({
      scope: "local",
    });
    if (signOutError) {
      console.error(
        `Non-admin session cleanup failed: ${signOutError.code ?? "unknown"}.`,
      );
    }
    return { status: "error", message: genericSignInError, fieldErrors: {} };
  }

  redirect(getSafeAdminPath(readFormString(formData, "next")));
}

export async function requestAdminPasswordRecovery(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = normalizeAdminEmail(readFormString(formData, "email"));

  if (!isValidAdminEmail(email)) {
    return {
      status: "error",
      message: "",
      fieldErrors: { email: "Enter a valid email address." },
    };
  }

  let siteUrl: string;
  try {
    siteUrl = getAuthSiteUrl();
  } catch (error) {
    if (!isAuthConfigurationFailure(error)) {
      throw error;
    }

    console.error("Admin password recovery origin is not configured.");
    return {
      status: "error",
      message: "Password recovery is not available. Contact the administrator.",
      fieldErrors: {},
    };
  }
  const redirectTo = new URL(
    "/auth/callback?next=%2Fadmin%2Freset-password",
    siteUrl,
  ).toString();

  let error: { code?: string } | null;
  try {
    const supabase = await createSupabaseAuthServerClient();
    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    error = response.error;
  } catch (requestError) {
    if (!isAuthConfigurationFailure(requestError)) {
      throw requestError;
    }

    console.error("Admin password recovery service is unavailable.");
    return {
      status: "error",
      message: "We could not send recovery instructions. Try again later.",
      fieldErrors: {},
    };
  }

  if (error) {
    console.error(
      `Admin password recovery request failed: ${error.code ?? "unknown"}.`,
    );
    return {
      status: "error",
      message: "We could not send recovery instructions. Try again later.",
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message:
      "If an account exists for that email, recovery instructions will be sent.",
    fieldErrors: {},
  };
}

export async function updateAdminPassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readFormString(formData, "password");
  const confirmation = readFormString(formData, "passwordConfirmation");
  const fieldErrors = validateNewAdminPassword(password, confirmation);

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "", fieldErrors };
  }

  let admin: Awaited<ReturnType<typeof getCurrentAdmin>>;
  try {
    admin = await getCurrentAdmin();
  } catch (error) {
    if (!isAuthConfigurationFailure(error)) {
      throw error;
    }

    console.error("Admin recovery session could not be verified.");
    return {
      status: "error",
      message: "This recovery link is no longer valid. Request a new one.",
      fieldErrors: {},
    };
  }

  if (!admin) {
    return {
      status: "error",
      message: "This recovery link is no longer valid. Request a new one.",
      fieldErrors: {},
    };
  }

  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error(
      `Admin password update failed: ${error.code ?? "unknown"}.`,
    );
    return {
      status: "error",
      message: "We could not update the password. Request a new recovery link.",
      fieldErrors: {},
    };
  }

  const { error: signOutError } = await supabase.auth.signOut({
    scope: "global",
  });
  if (signOutError) {
    console.error(
      `Admin sessions could not all be revoked after password update: ${signOutError.code ?? "unknown"}.`,
    );
    const { error: localSignOutError } = await supabase.auth.signOut({
      scope: "local",
    });
    if (localSignOutError) {
      console.error(
        `Local session cleanup failed after password update: ${localSignOutError.code ?? "unknown"}.`,
      );
    }
    redirect(
      "/admin/login?password-updated=1&session-revocation=failed",
    );
  }

  redirect("/admin/login?password-updated=1");
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createSupabaseAuthServerClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    console.error(
      `Admin sign-out failed: ${error.code ?? "unknown"}.`,
    );
    throw new Error("Unable to end the admin session. Please try again.");
  }

  redirect("/admin/login?signed-out=1");
}
