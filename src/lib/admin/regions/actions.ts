"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../auth/guard";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { SupabaseConfigurationError } from "../../supabase/config";
import { isRegionSlug } from "../../regions/model";
import { slugify } from "../../slug";
import type { RegionActionState } from "./state";

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function failed(message: string): RegionActionState {
  return { status: "error", message };
}

function getErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code.trim()
  ) {
    return error.code.trim();
  }

  return "unknown";
}

function revalidateRegionSurfaces() {
  revalidatePath("/");
  revalidatePath("/regions");
  revalidatePath("/properties");
  revalidatePath("/properties/[slug]", "page");
  revalidatePath("/admin/regions");
  revalidatePath("/admin/properties");
  revalidatePath("/admin/properties/[id]", "page");
}

async function getClient() {
  try {
    return await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin region mutation configuration is incomplete.");
    return null;
  }
}

export async function createRegion(
  _previousState: RegionActionState,
  formData: FormData,
): Promise<RegionActionState> {
  await requireAdmin();

  const name = readFormString(formData, "name");
  const slug = slugify(name);
  if (!name || !slug) {
    return failed("Enter a region name using letters or numbers.");
  }

  const client = await getClient();
  if (!client) {
    return failed("Region management is not available right now.");
  }

  let currentOrder: number | null;
  try {
    const { data, error } = await client
      .from("regions")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`Region order read failed: ${getErrorCode(error)}.`);
      return failed("The new region could not be saved. Try again.");
    }

    currentOrder =
      data && typeof data.display_order === "number"
        ? data.display_order
        : null;
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Region order request could not reach Supabase.");
    return failed("The new region could not be saved. Try again.");
  }

  const displayOrder = currentOrder === null ? 0 : currentOrder + 1;
  try {
    const { error } = await client.from("regions").insert({
      slug,
      name,
      display_order: displayOrder,
    });

    if (error) {
      console.error(`Region create failed: ${getErrorCode(error)}.`);
      return failed(
        error.code === "23505"
          ? "A region with that name already exists."
          : "The new region could not be saved. Try again.",
      );
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Region create request could not reach Supabase.");
    return failed("The new region could not be saved. Try again.");
  }

  revalidateRegionSurfaces();
  return { status: "success", message: "Region added." };
}

export async function renameRegion(
  _previousState: RegionActionState,
  formData: FormData,
): Promise<RegionActionState> {
  await requireAdmin();

  const slug = readFormString(formData, "slug");
  const name = readFormString(formData, "name");
  if (!isRegionSlug(slug) || !name || !slugify(name)) {
    return failed("Enter a valid region name.");
  }

  const client = await getClient();
  if (!client) {
    return failed("Region management is not available right now.");
  }

  try {
    const { data, error } = await client
      .from("regions")
      .update({ name })
      .eq("slug", slug)
      .select("slug")
      .maybeSingle();

    if (error) {
      console.error(`Region update failed: ${getErrorCode(error)}.`);
      return failed(
        error.code === "23505"
          ? "A region with that name already exists."
          : "The region could not be updated. Try again.",
      );
    }

    if (!data) {
      return failed("This region no longer exists. Reload the page.");
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Region update request could not reach Supabase.");
    return failed("The region could not be updated. Try again.");
  }

  revalidateRegionSurfaces();
  return { status: "success", message: "Region name updated." };
}

export async function deleteRegion(
  _previousState: RegionActionState,
  formData: FormData,
): Promise<RegionActionState> {
  await requireAdmin();

  const slug = readFormString(formData, "slug");
  if (!isRegionSlug(slug)) {
    return failed("This region reference is invalid. Reload the page.");
  }

  const client = await getClient();
  if (!client) {
    return failed("Region management is not available right now.");
  }

  try {
    const { data, error } = await client
      .from("regions")
      .delete()
      .eq("slug", slug)
      .select("slug")
      .maybeSingle();

    if (error) {
      console.error(`Region delete failed: ${getErrorCode(error)}.`);
      return failed(
        error.code === "23503"
          ? "Reassign properties from this region before deleting it."
          : "The region could not be deleted. Try again.",
      );
    }

    if (!data) {
      return failed("This region no longer exists. Reload the page.");
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Region delete request could not reach Supabase.");
    return failed("The region could not be deleted. Try again.");
  }

  revalidateRegionSurfaces();
  return { status: "success", message: "Region deleted." };
}
