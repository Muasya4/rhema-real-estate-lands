import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export type AdminIdentity = {
  id: string;
  email: string | null;
};

export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: role, error: roleError } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) {
    console.error(
      `Admin role verification failed: ${roleError.code ?? "unknown"}.`,
    );
    return null;
  }

  if (role?.role !== "admin") {
    return null;
  }

  return { id: user.id, email: user.email ?? null };
}

export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
