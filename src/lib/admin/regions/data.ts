import "server-only";

import { SupabaseConfigurationError } from "../../supabase/config";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { parseRegion, type Region } from "../../regions/model";

export type AdminRegionListResult =
  | { status: "success"; regions: Region[] }
  | { status: "error" };

export async function getAdminRegions(): Promise<AdminRegionListResult> {
  let client: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;
  try {
    client = await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin region configuration is incomplete.");
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("regions")
      .select("slug, name, display_order")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error(`Admin region read failed: ${error.code ?? "unknown"}.`);
      return { status: "error" };
    }

    if (!Array.isArray(data)) {
      console.error("Admin region read returned an invalid response.");
      return { status: "error" };
    }

    try {
      return { status: "success", regions: data.map(parseRegion) };
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Admin region data contains an invalid record.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin region request could not reach Supabase.");
    return { status: "error" };
  }
}
