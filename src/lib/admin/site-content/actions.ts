"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "../../auth/guard";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { SupabaseConfigurationError } from "../../supabase/config";
import {
  SITE_CONTENT_KEYS,
  SITE_CONTENT_SECTIONS,
  type SiteContentKey,
} from "../../site-content/defaults";
import { siteContentCacheTag } from "../../site-content/data";
import {
  getSiteContentSectionKeys,
  siteContentFieldMaximumLength,
} from "../../site-content/model";
import type { SiteContentActionState } from "./state";

function failed(
  message: string,
  fieldErrors: SiteContentActionState["fieldErrors"] = {},
): SiteContentActionState {
  return { status: "error", message, fieldErrors };
}

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
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

function getReturnedContentKeys(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const keys: string[] = [];
  for (const row of value) {
    if (
      typeof row !== "object" ||
      row === null ||
      !("content_key" in row) ||
      typeof row.content_key !== "string"
    ) {
      return null;
    }
    keys.push(row.content_key);
  }
  return keys;
}

async function getAdminClient() {
  try {
    return await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
    console.error("Admin site content configuration is incomplete.");
    return null;
  }
}

function revalidateSiteContent() {
  updateTag(siteContentCacheTag);
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

export async function saveSiteContentSection(
  _previousState: SiteContentActionState,
  formData: FormData,
): Promise<SiteContentActionState> {
  await requireAdmin();

  const sectionId = readFormString(formData, "sectionId");
  const sectionKeys = getSiteContentSectionKeys(sectionId);
  if (!sectionKeys) {
    return failed("This content section is not supported. Reload the page.");
  }

  const values: Partial<Record<SiteContentKey, string>> = {};
  const fieldErrors: SiteContentActionState["fieldErrors"] = {};
  for (const key of sectionKeys) {
    const rawValue = formData.get(`content.${key}`);
    if (typeof rawValue !== "string") {
      fieldErrors[key] = "Reload the page and try again.";
      continue;
    }

    const value = rawValue.trim();
    if (!value) {
      fieldErrors[key] = "Enter a value for this field.";
    } else if (value.length > siteContentFieldMaximumLength) {
      fieldErrors[key] = "Use 2,000 characters or fewer.";
    } else {
      values[key] = value;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return failed("Review the highlighted content fields.", fieldErrors);
  }

  const client = await getAdminClient();
  if (!client) {
    return failed("Content management is not available right now.");
  }

  const rows: { content_key: SiteContentKey; content_value: string }[] = [];
  for (const contentKey of sectionKeys) {
    const contentValue = values[contentKey];
    if (typeof contentValue !== "string") {
      return failed("Review the highlighted content fields.", {
        [contentKey]: "Reload the page and try again.",
      });
    }
    rows.push({ content_key: contentKey, content_value: contentValue });
  }

  try {
    const { data, error } = await client
      .from("site_content")
      .upsert(rows, { onConflict: "content_key" })
      .select("content_key");

    if (error) {
      console.error(`Admin site content save failed: ${getErrorCode(error)}.`);
      return failed("These content changes were not saved. Check the values and try again.");
    }

    const returnedKeys = getReturnedContentKeys(data);
    const expectedKeys = new Set<string>(sectionKeys);
    if (
      !returnedKeys ||
      returnedKeys.length !== sectionKeys.length ||
      new Set(returnedKeys).size !== sectionKeys.length ||
      returnedKeys.some((key) => !expectedKeys.has(key))
    ) {
      console.error("Admin site content save returned an incomplete result.");
      return failed("The save could not be verified. Reload the page before trying again.");
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin site content save could not reach Supabase.");
    return failed("These content changes were not saved. Try again.");
  }

  revalidateSiteContent();
  return {
    status: "success",
    message: "This section is saved and now live on the public site.",
    fieldErrors: {},
  };
}

export async function restoreSiteContent(
  _previousState: SiteContentActionState,
  formData: FormData,
): Promise<SiteContentActionState> {
  await requireAdmin();

  const scope = readFormString(formData, "scope");
  const sectionKeys =
    scope === "all" ? SITE_CONTENT_KEYS : getSiteContentSectionKeys(scope);
  if (!sectionKeys) {
    return failed("This reset option is not supported. Reload the page.");
  }

  const client = await getAdminClient();
  if (!client) {
    return failed("Content management is not available right now.");
  }

  try {
    const { error } = await client
      .from("site_content")
      .delete()
      .in("content_key", sectionKeys);

    if (error) {
      console.error(`Admin site content reset failed: ${getErrorCode(error)}.`);
      return failed("The original wording could not be restored. Try again.");
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin site content reset could not reach Supabase.");
    return failed("The original wording could not be restored. Try again.");
  }

  revalidateSiteContent();
  const sectionName =
    SITE_CONTENT_SECTIONS.find(({ id }) => id === scope)?.title ?? "all public pages";
  return {
    status: "success",
    message: `Original wording restored for ${sectionName}.`,
    fieldErrors: {},
  };
}
