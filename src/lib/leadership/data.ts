import "server-only";

import { io } from "next/cache";
import { SupabaseConfigurationError } from "../supabase/config";
import { createSupabaseServerClient } from "../supabase/server";
import { parseLeadershipProfile, type LeadershipProfile } from "./model";

export type PublicLeadershipResult =
  | { status: "success"; profile: LeadershipProfile; imageSrc: string | null }
  | { status: "error" };

const profileSelection =
  "profile_key, full_name, title, email, biography, image_path";

export async function getPublicLeadershipProfile(): Promise<PublicLeadershipResult> {
  await io();

  let client: ReturnType<typeof createSupabaseServerClient>;
  try {
    client = createSupabaseServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Public leadership profile configuration is incomplete.");
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
        `Public leadership profile read failed: ${error?.code ?? "not-found"}.`,
      );
      return { status: "error" };
    }

    try {
      const profile = parseLeadershipProfile(data);
      return {
        status: "success",
        profile,
        imageSrc: profile.imagePath
          ? client.storage
              .from("property-images")
              .getPublicUrl(profile.imagePath).data.publicUrl
          : null,
      };
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      console.error("Public leadership profile contains an invalid record.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Public leadership profile request could not reach Supabase.");
    return { status: "error" };
  }
}
