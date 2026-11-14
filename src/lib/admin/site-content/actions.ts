"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "../../auth/guard";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { SupabaseConfigurationError } from "../../supabase/config";
import {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_SECTIONS,
  type SiteContentKey,
} from "../../site-content/defaults";
import { siteContentCacheTag } from "../../site-content/data";
import {
  getSiteContentSectionImages,
  getSiteContentSectionKeys,
  getSiteContentSectionTextKeys,
  parseSiteContentOverrides,
  siteContentFieldMaximumLength,
} from "../../site-content/model";
import {
  getImageExtension,
  validateImageFile,
} from "../../storage/image-validation";
import type { SiteContentActionState } from "./state";

type AdminClient = Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;

type ImageUpload = {
  key: SiteContentKey;
  path: string;
  file: File;
};

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

async function getAdminClient(): Promise<AdminClient | null> {
  try {
    return await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) throw error;
    console.error("Admin site content configuration is incomplete.");
    return null;
  }
}

async function readExistingImagePaths(
  client: AdminClient,
  keys: SiteContentKey[],
): Promise<Map<SiteContentKey, string> | null> {
  if (keys.length === 0) return new Map();

  try {
    const { data, error } = await client
      .from("site_content")
      .select("content_key, content_value")
      .in("content_key", keys);

    if (error) {
      console.error(`Admin site image precheck failed: ${getErrorCode(error)}.`);
      return null;
    }

    const overrides = parseSiteContentOverrides(data);
    return new Map(
      keys.flatMap((key) => {
        const path = overrides[key];
        return typeof path === "string" && path.startsWith("site-content/")
          ? [[key, path] as const]
          : [];
      }),
    );
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin site image precheck returned invalid data or could not reach Supabase.");
    return null;
  }
}

async function removeImagePaths(
  client: AdminClient,
  paths: string[],
  context: string,
): Promise<boolean> {
  if (paths.length === 0) return true;

  try {
    const { error } = await client.storage
      .from("property-images")
      .remove(paths);
    if (error) {
      console.error(`${context} failed: ${getErrorCode(error)}.`);
      return false;
    }
    return true;
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error(`${context} could not reach Supabase Storage.`);
    return false;
  }
}

async function removeUploadedImages(
  client: AdminClient,
  uploads: ImageUpload[],
): Promise<boolean> {
  return removeImagePaths(
    client,
    uploads.map(({ path }) => path),
    "New site image cleanup",
  );
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
  const textKeys = getSiteContentSectionTextKeys(sectionId);
  const imageFields = getSiteContentSectionImages(sectionId);
  const sectionKeys = getSiteContentSectionKeys(sectionId);
  if (!textKeys || !imageFields || !sectionKeys) {
    return failed("This content section is not supported. Reload the page.");
  }

  const values: Partial<Record<SiteContentKey, string>> = {};
  const fieldErrors: SiteContentActionState["fieldErrors"] = {};
  for (const key of textKeys) {
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

  const selectedImages: { key: SiteContentKey; slot: string; file: File }[] = [];
  for (const field of imageFields) {
    const entry = formData.get(`image.${field.key}`);
    if (entry === null || (typeof entry !== "string" && entry.size === 0)) {
      continue;
    }
    if (typeof entry === "string") {
      fieldErrors[field.key] = "Choose an image file to upload.";
      continue;
    }

    const validationError = await validateImageFile(entry);
    if (validationError) {
      fieldErrors[field.key] = validationError;
      continue;
    }

    const extension = getImageExtension(entry.type);
    if (!extension) {
      fieldErrors[field.key] = "Use a JPEG, PNG, or WebP image.";
      continue;
    }

    if (values[field.altKey] === SITE_CONTENT_DEFAULTS[field.altKey]) {
      fieldErrors[field.altKey] =
        "Describe the selected image before uploading it.";
      continue;
    }

    selectedImages.push({
      key: field.key,
      slot: field.slot,
      file: entry,
    });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return failed("Review the highlighted content fields.", fieldErrors);
  }

  const client = await getAdminClient();
  if (!client) {
    return failed("Content management is not available right now.");
  }

  const imageKeys = selectedImages.map(({ key }) => key);
  const existingImagePaths = await readExistingImagePaths(client, imageKeys);
  if (!existingImagePaths) {
    return failed("The current image could not be checked. Reload and try again.");
  }

  const uploadedImages: ImageUpload[] = [];
  for (const { key, slot, file } of selectedImages) {
    const extension = getImageExtension(file.type);
    if (!extension) {
      return failed("Use a JPEG, PNG, or WebP image.", {
        [key]: "Use a JPEG, PNG, or WebP image.",
      });
    }

    const path = `site-content/home/${slot}/${crypto.randomUUID()}.${extension}`;
    try {
      const { error } = await client.storage
        .from("property-images")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
      if (error) {
        console.error(`Site content image upload failed: ${getErrorCode(error)}.`);
        const cleanupSucceeded = await removeUploadedImages(client, uploadedImages);
        return failed(
          cleanupSucceeded
            ? "The image could not be uploaded. Check Storage setup and try again."
            : "The image could not be uploaded, and an unused upload could not be removed. Contact support before retrying.",
          { [key]: "The image could not be uploaded." },
        );
      }
      uploadedImages.push({ key, path, file });
      values[key] = path;
    } catch (error) {
      const cleanupSucceeded = await removeUploadedImages(client, uploadedImages);
      if (!(error instanceof TypeError)) throw error;
      console.error("Site content image upload could not reach Supabase Storage.");
      return failed(
        cleanupSucceeded
          ? "The image could not be uploaded. Try again."
          : "The image could not be uploaded, and an unused upload could not be removed. Contact support before retrying.",
        { [key]: "The image could not be uploaded." },
      );
    }
  }

  const rows: { content_key: SiteContentKey; content_value: string }[] = [];
  for (const contentKey of textKeys) {
    const contentValue = values[contentKey];
    if (typeof contentValue !== "string") {
      const cleanupSucceeded = await removeUploadedImages(client, uploadedImages);
      return failed(
        cleanupSucceeded
          ? "Review the highlighted content fields."
          : "The content was not saved, and an unused upload could not be removed. Contact support before retrying.",
        { [contentKey]: "Reload the page and try again." },
      );
    }
    rows.push({ content_key: contentKey, content_value: contentValue });
  }
  for (const { key, path } of uploadedImages) {
    rows.push({ content_key: key, content_value: path });
  }

  try {
    const { data, error } = await client
      .from("site_content")
      .upsert(rows, { onConflict: "content_key" })
      .select("content_key");

    if (error) {
      console.error(`Admin site content save failed: ${getErrorCode(error)}.`);
      const cleanupSucceeded = await removeUploadedImages(client, uploadedImages);
      return failed(
        cleanupSucceeded
          ? "These changes were not saved. Check the values and try again."
          : "The text was not saved, and an unused image could not be removed. Contact support before retrying.",
      );
    }

    const returnedKeys = getReturnedContentKeys(data);
    const expectedKeys = new Set<string>(
      rows.map(({ content_key }) => content_key),
    );
    if (
      !returnedKeys ||
      returnedKeys.length !== rows.length ||
      new Set(returnedKeys).size !== rows.length ||
      returnedKeys.some((key) => !expectedKeys.has(key))
    ) {
      console.error("Admin site content save returned an incomplete result.");
      const cleanupSucceeded = await removeUploadedImages(client, uploadedImages);
      return failed(
        cleanupSucceeded
          ? "The save could not be verified. Reload the page before trying again."
          : "The save could not be verified, and an unused image could not be removed. Check this section before retrying.",
      );
    }
  } catch (error) {
    const cleanupSucceeded = await removeUploadedImages(client, uploadedImages);
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin site content save could not reach Supabase.");
    return failed(
      cleanupSucceeded
        ? "These changes were not saved. Try again."
        : "The changes were not saved, and an unused image could not be removed. Contact support before retrying.",
    );
  }

  const oldImagePaths = uploadedImages.flatMap(({ key }) => {
    const path = existingImagePaths.get(key);
    return path ? [path] : [];
  });
  const cleanupSucceeded = await removeImagePaths(
    client,
    oldImagePaths,
    "Replaced site image cleanup",
  );

  revalidateSiteContent();
  return {
    status: "success",
    message: cleanupSucceeded
      ? "This section is saved and now live on the public site."
      : "This section is saved and live. An older image could not be removed from Storage.",
    fieldErrors: {},
  };
}

export async function restoreSiteContent(
  _previousState: SiteContentActionState,
  formData: FormData,
): Promise<SiteContentActionState> {
  await requireAdmin();

  const scope = readFormString(formData, "scope");
  const sectionKeys = getSiteContentSectionKeys(scope);
  const imageFields = getSiteContentSectionImages(scope);
  if (!sectionKeys || !imageFields) {
    return failed("This reset option is not supported. Reload the page.");
  }

  const client = await getAdminClient();
  if (!client) {
    return failed("Content management is not available right now.");
  }

  const imageKeys = imageFields.map(({ key }) => key);
  const existingImagePaths = await readExistingImagePaths(client, imageKeys);
  if (!existingImagePaths) {
    return failed("The current image could not be checked. Reload and try again.");
  }

  try {
    const { error } = await client
      .from("site_content")
      .delete()
      .in("content_key", sectionKeys);

    if (error) {
      console.error(`Admin site content reset failed: ${getErrorCode(error)}.`);
      return failed("This section could not be restored. Try again.");
    }
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    console.error("Admin site content reset could not reach Supabase.");
    return failed("This section could not be restored. Try again.");
  }

  const cleanupSucceeded = await removeImagePaths(
    client,
    [...existingImagePaths.values()],
    "Restored site image cleanup",
  );
  revalidateSiteContent();
  const sectionName =
    SITE_CONTENT_SECTIONS.find(({ id }) => id === scope)?.title ?? "this section";
  return {
    status: "success",
    message: cleanupSucceeded
      ? `Original copy and images restored for ${sectionName}.`
      : `Original copy and images restored for ${sectionName}. An old image could not be removed from Storage.`,
    fieldErrors: {},
  };
}
