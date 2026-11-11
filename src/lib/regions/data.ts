import "server-only";

import { io } from "next/cache";
import { SupabaseConfigurationError } from "../supabase/config";
import { createSupabaseServerClient } from "../supabase/server";
import { parseRegion, type Region } from "./model";

export type RegionListResult =
  | { status: "success"; regions: Region[] }
  | { status: "error" };

export async function getPublicRegions(): Promise<RegionListResult> {
  await io();

  let client: ReturnType<typeof createSupabaseServerClient>;
  try {
    client = createSupabaseServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Public region configuration is incomplete.");
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("regions")
      .select("slug, name, display_order")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error(`Public region read failed: ${error.code ?? "unknown"}.`);
      return { status: "error" };
    }

    if (!Array.isArray(data)) {
      console.error("Public region read returned an invalid response.");
      return { status: "error" };
    }

    try {
      return { status: "success", regions: data.map(parseRegion) };
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Public region data contains an invalid record.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Public region request could not reach Supabase.");
    return { status: "error" };
  }
}
