import "server-only";

import { SupabaseConfigurationError } from "../../supabase/config";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import {
  parseLeadershipProfile,
  type LeadershipProfile,
} from "../../leadership/model";

export type AdminLeadershipResult =
  | { status: "found"; profile: LeadershipProfile; imageSrc: string | null }
  | { status: "error" };

const profileSelection =
  "profile_key, full_name, title, email, biography, image_path";

export async function getAdminLeadershipProfile(): Promise<AdminLeadershipResult> {
  let client: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;
  try {
    client = await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
    console.error("Admin leadership profile configuration is incomplete.");
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("leadership_profile")
      .select(profileSelection)
      .eq("profile_key", "ceo")
      .maybeSingle();

    if (error || !data) {
      console.error(
        `Admin leadership profile read failed: ${error?.code ?? "not-found"}.`,
      );
      return { status: "error" };
    }

    try {
      const profile = parseLeadershipProfile(data);
      return {
        status: "found",
        profile,
        imageSrc: profile.imagePath
          ? client.storage
              .from("property-images")
              .getPublicUrl(profile.imagePath).data.publicUrl
          : null,
      };
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      console.error("Admin leadership profile contains an invalid record.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin leadership profile request could not reach Supabase.");
    return { status: "error" };
  }
}
