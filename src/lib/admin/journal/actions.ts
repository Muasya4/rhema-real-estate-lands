"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../auth/guard";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { SupabaseConfigurationError } from "../../supabase/config";
import { slugify } from "../../slug";
import {
  getImageExtension,
  validateImageFile,
} from "../../storage/image-validation";
import { parseJournalCoverImage } from "../../journal/model";
import type { JournalActionState } from "./state";
import { validateJournalForm, parseNairobiDateTime } from "./validation";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function failed(
  message: string,
  fieldErrors: JournalActionState["fieldErrors"] = {},
): JournalActionState {
  return { status: "error", message, fieldErrors };
}

function getErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null) {
    return "unknown";
  }
  if ("code" in error && typeof error.code === "string" && error.code.trim()) {
    return error.code.trim();
  }
  if (
    "statusCode" in error &&
    typeof error.statusCode === "string" &&
    error.statusCode.trim()
  ) {
    return error.statusCode.trim();
  }
  return "unknown";
}

function isDuplicateSlug(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "23505" &&
    (error.message?.includes("blog_posts_slug_key") ?? false)
  );
}

async function removeUploadedCover(
  client: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>,
  path: string,
): Promise<boolean> {
  try {
    const { error } = await client.storage.from("property-images").remove([path]);
    if (error) {
      console.error(`Unreferenced Journal cover cleanup failed: ${getErrorCode(error)}.`);
      return false;
    }
    return true;
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Unreferenced Journal cover cleanup could not reach Storage.");
    return false;
  }
}

export async function saveJournalPost(
  _previousState: JournalActionState,
  formData: FormData,
): Promise<JournalActionState> {
  await requireAdmin();

  const suppliedId = readFormString(formData, "id");
  if (!suppliedId && !readFormString(formData, "slug")) {
    formData.set("slug", slugify(readFormString(formData, "title")));
  }

  const validation = validateJournalForm(formData);
  if (!validation.success) {
    return failed("Review the highlighted article fields.", validation.fieldErrors);
  }
  if (suppliedId && !uuidPattern.test(suppliedId)) {
    return failed("This article reference is invalid. Reload the page and try again.");
  }

  const postId = suppliedId || crypto.randomUUID();
  let supabase: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;
  try {
    supabase = await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin Journal mutation configuration is incomplete.");
    return failed("Journal management is not available right now.");
  }

  let existingSlug: string | null = null;
  let existingCover: string | null = null;
  let existingPublishedAt: string | null = null;

  if (suppliedId) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, cover_image, published_at")
        .eq("id", postId)
        .maybeSingle();

      if (error) {
        console.error(`Admin Journal precheck failed: ${getErrorCode(error)}.`);
        return failed("This article could not be loaded. Try again.");
      }
      if (!data) {
        return failed("This article is no longer available. Reload the list.");
      }

      existingSlug = data.slug;
      existingCover = parseJournalCoverImage(data.cover_image);
      if (
        data.published_at !== null &&
        typeof data.published_at !== "string"
      ) {
        throw new TypeError("Stored Journal publication date is invalid.");
      }
      existingPublishedAt = data.published_at;
      if (
        existingPublishedAt !== null &&
        !Number.isFinite(Date.parse(existingPublishedAt))
      ) {
        throw new TypeError("Stored Journal publication date is invalid.");
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Admin Journal precheck returned invalid data or failed to reach Supabase.");
      return failed("This article could not be loaded safely. Reload the page.");
    }
  }

  if (
    validation.values.coverImage !== null &&
    validation.values.coverImage !== existingCover
  ) {
    return failed(
      "The cover image reference changed unexpectedly. Reload the page and try again.",
      { coverImage: "Reload the page and try again." },
    );
  }

  let publishedAt: string | null = null;
  if (validation.values.publicationChoice === "scheduled") {
    publishedAt = parseNairobiDateTime(validation.values.scheduledAtLocal);
    if (!publishedAt) {
      return failed("Choose a valid future publication time.", {
        scheduledAt: "Choose a valid future date and time in Nairobi.",
      });
    }
  } else if (validation.values.publicationChoice === "published") {
    publishedAt =
      existingPublishedAt && Date.parse(existingPublishedAt) <= Date.now()
        ? existingPublishedAt
        : new Date().toISOString();
  }

  let uploadedPath: string | null = null;
  let coverImage = validation.values.coverImage;
  if (validation.values.coverFile) {
    const imageError = await validateImageFile(validation.values.coverFile);
    if (imageError) {
      return failed("The cover image could not be uploaded.", {
        coverFile: imageError,
      });
    }

    const extension = getImageExtension(validation.values.coverFile.type);
    if (!extension) {
      return failed("The cover image could not be uploaded.", {
        coverFile: "Use a JPEG, PNG, or WebP image.",
      });
    }

    uploadedPath = `journal/${postId}/${crypto.randomUUID()}.${extension}`;
    try {
      const { error } = await supabase.storage
        .from("property-images")
        .upload(uploadedPath, validation.values.coverFile, {
          contentType: validation.values.coverFile.type,
          upsert: false,
        });
      if (error) {
        console.error(`Journal cover upload failed: ${getErrorCode(error)}.`);
        return failed(
          "The cover image could not be uploaded. Check the Storage setup and try again.",
        );
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Journal cover upload could not reach Supabase Storage.");
      return failed("The cover image could not be uploaded. Try again.");
    }
    coverImage = uploadedPath;
  }

  const values = {
    title: validation.values.title,
    slug: validation.values.slug,
    excerpt: validation.values.excerpt,
    content: validation.values.content,
    cover_image: coverImage,
    published_at: publishedAt,
  };

  let mutationError: { code?: string; message?: string } | null = null;
  let saved = false;
  try {
    if (suppliedId) {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(values)
        .eq("id", postId)
        .select("id")
        .maybeSingle();
      mutationError = error;
      saved = Boolean(data);
    } else {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({ id: postId, ...values })
        .select("id")
        .single();
      mutationError = error;
      saved = Boolean(data);
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin Journal save could not be confirmed.");
    return failed(
      uploadedPath
        ? "The save could not be confirmed. The new cover was kept to avoid breaking a possible saved reference. Check the article list before retrying."
        : "The save could not be confirmed. Check the article list before retrying.",
    );
  }

  if (mutationError || !saved) {
    if (mutationError) {
      console.error(`Admin Journal save failed: ${getErrorCode(mutationError)}.`);
    } else {
      console.error("Admin Journal save returned no saved record.");
    }

    let cleanupSucceeded = true;
    if (uploadedPath) {
      cleanupSucceeded = await removeUploadedCover(supabase, uploadedPath);
    }
    if (mutationError && isDuplicateSlug(mutationError)) {
      return failed(
        cleanupSucceeded
          ? "An article already uses this slug."
          : "An article already uses this slug, and the new cover could not be removed from Storage. Contact the administrator.",
        { slug: "Choose a different slug." },
      );
    }
    return failed(
      cleanupSucceeded
        ? "The article was not saved. Check the values and try again."
        : "The article was not saved, and the new cover could not be removed from Storage. Contact the administrator.",
    );
  }

  const replacedCover =
    existingCover && existingCover !== coverImage ? existingCover : null;
  let cleanupWarning = false;
  if (replacedCover) {
    try {
      const { error } = await supabase.storage
        .from("property-images")
        .remove([replacedCover]);
      if (error) {
        console.error(`Replaced Journal cover cleanup failed: ${getErrorCode(error)}.`);
        cleanupWarning = true;
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Replaced Journal cover cleanup could not reach Storage.");
      cleanupWarning = true;
    }
  }

  revalidatePath("/journal");
  revalidatePath("/journal/[slug]", "page");
  revalidatePath("/admin/journal");
  revalidatePath(`/admin/journal/${postId}`);
  revalidatePath(`/admin/journal/${postId}/preview`);
  if (existingSlug) {
    revalidatePath(`/journal/${existingSlug}`);
  }
  if (validation.values.slug !== existingSlug) {
    revalidatePath(`/journal/${validation.values.slug}`);
  }

  redirect(
    cleanupWarning
      ? `/admin/journal/${postId}?saved=1&storage-warning=1`
      : `/admin/journal/${postId}?saved=1`,
  );
}
