import "server-only";

import {
  parsePublicProperty,
  type PropertyStatus,
} from "../../properties/model";
import type { PropertyImage } from "../../properties/images";
import { SupabaseConfigurationError } from "../../supabase/config";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { isRegionSlug } from "../../regions/model";

export type AdminProperty = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  region: string;
  regionName: string;
  priceKes: number | null;
  plotSize: string | null;
  status: PropertyStatus | null;
  featured: boolean;
  isPublished: boolean;
  createdAt: string;
  images: PropertyImage[];
};

export type AdminPropertyListResult =
  | { status: "success"; properties: AdminProperty[] }
  | { status: "error" };

export type AdminPropertyResult =
  | { status: "found"; property: AdminProperty }
  | { status: "not-found" }
  | { status: "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAdminProperty(value: unknown): AdminProperty {
  if (!isRecord(value)) {
    throw new TypeError("Admin property record must be an object.");
  }

  const property = parsePublicProperty(value);
  const region = value.region;
  const regionInfo = value.regionInfo;
  const regionName =
    isRecord(regionInfo) && typeof regionInfo.name === "string"
      ? regionInfo.name
      : null;
  const description = value.description;

  if (
    typeof region !== "string" ||
    !isRegionSlug(region) ||
    !regionName?.trim()
  ) {
    throw new TypeError("Admin property region is invalid.");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new TypeError("Admin property description is invalid.");
  }

  if (typeof value.is_published !== "boolean") {
    throw new TypeError("Admin property publication state is invalid.");
  }

  return {
    ...property,
    description,
    region,
    regionName,
    isPublished: value.is_published,
  };
}

async function getClient() {
  try {
    return await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin property database configuration is incomplete.");
    return null;
  }
}

export async function getAdminProperties(): Promise<AdminPropertyListResult> {
  const client = await getClient();
  if (!client) {
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("properties")
      .select(
        "id, title, slug, description, location, region, regionInfo:regions!properties_region_slug_fkey(name), price_kes, plot_size, status, featured, is_published, created_at, images",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `Admin property list read failed: ${error.code ?? "unknown"}.`,
      );
      return { status: "error" };
    }

    if (!Array.isArray(data)) {
      console.error("Admin property list returned an invalid response.");
      return { status: "error" };
    }

    try {
      return {
        status: "success",
        properties: data.map(parseAdminProperty),
      };
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Admin property list contains an invalid record.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin property list request could not reach Supabase.");
    return { status: "error" };
  }
}

export async function getAdminProperty(
  id: string,
): Promise<AdminPropertyResult> {
  const client = await getClient();
  if (!client) {
    return { status: "error" };
  }

  try {
    const { data, error } = await client
      .from("properties")
      .select(
        "id, title, slug, description, location, region, regionInfo:regions!properties_region_slug_fkey(name), price_kes, plot_size, status, featured, is_published, created_at, images",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        `Admin property read failed: ${error.code ?? "unknown"}.`,
      );
      return { status: "error" };
    }

    if (data === null) {
      return { status: "not-found" };
    }

    try {
      return { status: "found", property: parseAdminProperty(data) };
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Admin property record is invalid.");
      return { status: "error" };
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin property request could not reach Supabase.");
    return { status: "error" };
  }
}
