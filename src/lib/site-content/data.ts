import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { SupabaseConfigurationError } from "../supabase/config";
import { createSupabaseAuthServerClient } from "../supabase/auth-server";
import { createSupabaseServerClient } from "../supabase/server";
import {
  applySiteContentOverrides,
  parseSiteContentOverrides,
} from "./model";
import {
  getDefaultSiteContent,
  type SiteContent,
} from "./defaults";

export const siteContentCacheTag = "public-site-content";

export type AdminSiteContentResult =
  | { status: "success"; content: SiteContent }
  | { status: "error" };

export async function getPublicSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("minutes");
  cacheTag(siteContentCacheTag);

  const defaults = getDefaultSiteContent();
  let client: ReturnType<typeof createSupabaseServerClient>;
  try {
    client = createSupabaseServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
    console.error("Public site content configuration is incomplete; using built-in defaults.");
    return defaults;
  }

  try {
    const { data, error } = await client
      .from("site_content")
      .select("content_key, content_value")
      .order("content_key", { ascending: true });

    if (error) {
      console.error(
        `Public site content read failed: ${error.code ?? "unknown"}; using built-in defaults.`,
      );
      return defaults;
    }

    try {
      return applySiteContentOverrides(parseSiteContentOverrides(data));
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      console.error("Public site content is invalid; using built-in defaults.");
      return defaults;
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Public site content request failed; using built-in defaults.");
    return defaults;
  }
}

export async function getAdminSiteContent(): Promise<AdminSiteContentResult> {
  let client: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;
  try {
    client = await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
    console.error("Admin site content configuration is incomplete.");
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("site_content")
      .select("content_key, content_value")
      .order("content_key", { ascending: true });

    if (error) {
      console.error(
        `Admin site content read failed: ${error.code ?? "unknown"}.`,
      );
      return { status: "error" };
    }

    try {
      return {
        status: "success",
        content: applySiteContentOverrides(parseSiteContentOverrides(data)),
      };
    } catch (error) {
      if (!(error instanceof TypeError)) throw error;
      console.error("Admin site content contains invalid records.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin site content request could not reach Supabase.");
    return { status: "error" };
  }
}
