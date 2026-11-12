"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../auth/guard";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { SupabaseConfigurationError } from "../../supabase/config";
import {
  getImageExtension,
  validateImageFile,
} from "../../storage/image-validation";
import {
  parseLeadershipImagePath,
  parseLeadershipProfile,
} from "../../leadership/model";
import type { LeadershipActionState } from "./state";
import { validateLeadershipForm } from "./validation";

function failed(
  message: string,
  fieldErrors: LeadershipActionState["fieldErrors"] = {},
): LeadershipActionState {
  return { status: "error", message, fieldErrors };
}

function getErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null) return "unknown";
  if ("code" in error && typeof error.code === "string" && error.code.trim()) {
    return error.code.trim();
  }
  if (
    "statusCode" in error &&
    typeof error.statusCode === "string" &&
    error.statusCode.trim()
  ) {
    return error.statusCode.trim();
  }
  return "unknown";
}

async function removeImage(
  client: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>,
  path: string,
): Promise<boolean> {
  try {
    const { error } = await client.storage
      .from("property-images")
      .remove([path]);
    if (error) {
      console.error(`Leadership image cleanup failed: ${getErrorCode(error)}.`);
      return false;
    }
    return true;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Leadership image cleanup could not reach Storage.");
    return false;
  }
}

export async function saveLeadershipProfile(
  _previousState: LeadershipActionState,
  formData: FormData,
): Promise<LeadershipActionState> {
  await requireAdmin();

  const validation = validateLeadershipForm(formData);
  if (!validation.success) {
    return failed("Review the highlighted leadership fields.", validation.fieldErrors);
  }

  let supabase: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;
  try {
    supabase = await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
    console.error("Admin leadership mutation configuration is incomplete.");
    return failed("Leadership management is not available right now.");
  }

  let existingImagePath: string | null;
  try {
    const { data, error } = await supabase
      .from("leadership_profile")
      .select("image_path")
      .eq("profile_key", "ceo")
      .maybeSingle();
    if (error || !data) {
      console.error(
        `Admin leadership precheck failed: ${error?.code ?? "not-found"}.`,
      );
      return failed("The CEO profile could not be loaded. Reload the page and try again.");
    }
    existingImagePath = parseLeadershipImagePath(data.image_path);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin leadership precheck returned invalid data or could not reach Supabase.");
    return failed("The CEO profile could not be loaded safely. Reload the page.");
  }

  let uploadedPath: string | null = null;
  let imagePath = validation.values.removeImage ? null : existingImagePath;

  if (validation.values.imageFile) {
    const imageError = await validateImageFile(validation.values.imageFile);
    if (imageError) {
      return failed("The portrait could not be uploaded.", {
        imageFile: imageError,
      });
    }

    const extension = getImageExtension(validation.values.imageFile.type);
    if (!extension) {
      return failed("The portrait could not be uploaded.", {
        imageFile: "Use a JPEG, PNG, or WebP image.",
      });
    }

    uploadedPath = `leadership/${crypto.randomUUID()}.${extension}`;
    try {
      const { error } = await supabase.storage
        .from("property-images")
        .upload(uploadedPath, validation.values.imageFile, {
          contentType: validation.values.imageFile.type,
          upsert: false,
        });
      if (error) {
        console.error(`Leadership image upload failed: ${getErrorCode(error)}.`);
        return failed(
          "The portrait could not be uploaded. Check Storage setup and try again.",
        );
      }
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      console.error("Leadership image upload could not reach Supabase Storage.");
      return failed("The portrait could not be uploaded. Try again.");
    }
    imagePath = uploadedPath;
  }

  let data: unknown = null;
  let mutationError: { code?: string } | null = null;
  try {
    const result = await supabase
      .from("leadership_profile")
      .update({
        full_name: validation.values.fullName,
        title: validation.values.title,
        email: validation.values.email,
        biography: validation.values.biography,
        image_path: imagePath,
      })
      .eq("profile_key", "ceo")
      .select("profile_key, full_name, title, email, biography, image_path")
      .maybeSingle();
    data = result.data;
    mutationError = result.error;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin leadership save could not be confirmed.");
    return failed(
      uploadedPath
        ? "The save could not be confirmed. The new image was kept to avoid breaking a possible saved reference. Check the profile before retrying."
        : "The save could not be confirmed. Check the profile before retrying.",
    );
  }

  if (mutationError || !data) {
    if (mutationError) {
      console.error(`Admin leadership save failed: ${getErrorCode(mutationError)}.`);
    } else {
      console.error("Admin leadership save returned no updated profile.");
    }
    let cleanupSucceeded = true;
    if (uploadedPath) {
      cleanupSucceeded = await removeImage(supabase, uploadedPath);
    }
    return failed(
      cleanupSucceeded
        ? "The CEO profile was not saved. Check the values and try again."
        : "The CEO profile was not saved, and the new image could not be removed from Storage. Contact the administrator.",
    );
  }

  try {
    parseLeadershipProfile(data);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Saved leadership profile returned invalid data.");
    return failed("The profile was saved, but its result could not be verified. Reload the page.");
  }

  const replacedImage =
    existingImagePath && existingImagePath !== imagePath
      ? existingImagePath
      : null;
  const cleanupWarning = replacedImage
    ? !(await removeImage(supabase, replacedImage))
    : false;

  revalidatePath("/about");
  revalidatePath("/admin/about");
  redirect(
    cleanupWarning
      ? "/admin/about?saved=1&storage-warning=1"
      : "/admin/about?saved=1",
  );
}
