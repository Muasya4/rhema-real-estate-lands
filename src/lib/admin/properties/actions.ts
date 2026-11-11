"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../auth/guard";
import { createSupabaseAuthServerClient } from "../../supabase/auth-server";
import { SupabaseConfigurationError } from "../../supabase/config";
import {
  parsePropertyImages,
  type PropertyImage,
} from "../../properties/images";
import {
  getPropertyImageExtension,
  validatePropertyForm,
  validatePropertyImageFile,
} from "./validation";
import type { PropertyActionState } from "./state";
import { slugify } from "../../slug";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readFormString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function failed(
  message: string,
  fieldErrors: PropertyActionState["fieldErrors"] = {},
): PropertyActionState {
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
    (error.message?.includes("properties_slug_key") ?? false)
  );
}

function isUnavailableRegion(error: { code?: string; message?: string }): boolean {
  return (
    error.code === "23503" &&
    (error.message?.includes("properties_region_slug_fkey") ?? false)
  );
}

async function removeUploadedImage(
  client: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>,
  path: string,
): Promise<boolean> {
  try {
    const { error } = await client.storage
      .from("property-images")
      .remove([path]);
    if (error) {
      console.error(
        `Unreferenced property image cleanup failed: ${getErrorCode(error)}.`,
      );
      return false;
    }

    return true;
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Unreferenced property image cleanup could not reach Storage.");
    return false;
  }
}

export async function saveProperty(
  _previousState: PropertyActionState,
  formData: FormData,
): Promise<PropertyActionState> {
  await requireAdmin();

  if (!readFormString(formData, "id") && !readFormString(formData, "slug")) {
    formData.set("slug", slugify(readFormString(formData, "title")));
  }

  const validation = validatePropertyForm(formData);
  if (!validation.success) {
    return failed("Review the highlighted property fields.", validation.fieldErrors);
  }

  const suppliedId = readFormString(formData, "id");
  if (suppliedId && !uuidPattern.test(suppliedId)) {
    return failed("This property reference is invalid. Reload the page and try again.");
  }

  const propertyId = suppliedId || crypto.randomUUID();
  let supabase: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;

  try {
    supabase = await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin property mutation configuration is incomplete.");
    return failed("Property management is not available right now.");
  }

  let existingSlug: string | null = null;
  let existingImages: PropertyImage[] = [];

  if (suppliedId) {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("slug, images")
        .eq("id", propertyId)
        .maybeSingle();

      if (error) {
        console.error(
          `Admin property update precheck failed: ${getErrorCode(error)}.`,
        );
        return failed("This property could not be loaded. Try again.");
      }

      if (!data) {
        return failed("This property is no longer available. Reload the list.");
      }

      existingSlug = data.slug;
      try {
        existingImages = parsePropertyImages(data.images);
      } catch (error) {
        if (!(error instanceof TypeError)) {
          throw error;
        }

        console.error("Stored property image data is invalid.");
        return failed("The property's image list could not be edited safely.");
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Admin property update precheck could not reach Supabase.");
      return failed("This property could not be loaded. Try again.");
    }
  }

  const existingImagePaths = new Set(existingImages.map((image) => image.path));
  if (
    validation.values.images.some((image) => !existingImagePaths.has(image.path))
  ) {
    return failed(
      "The image list contains an item that does not belong to this property. Reload the page.",
      { images: "Reload the page and try again." },
    );
  }

  let uploadedPath: string | null = null;
  let finalImages = validation.values.images;

  if (validation.imageFile) {
    const imageError = await validatePropertyImageFile(validation.imageFile);
    if (imageError) {
      return failed("The image could not be uploaded.", {
        imageFile: imageError,
      });
    }

    const extension = getPropertyImageExtension(validation.imageFile.type);
    if (!extension) {
      return failed("The image could not be uploaded.", {
        imageFile: "Use a JPEG, PNG, or WebP image.",
      });
    }

    const imagePath = `${propertyId}/${crypto.randomUUID()}.${extension}`;
    try {
      const { error } = await supabase.storage
        .from("property-images")
        .upload(imagePath, validation.imageFile, {
          contentType: validation.imageFile.type,
          upsert: false,
        });

      if (error) {
        console.error(
          `Property image upload failed: ${getErrorCode(error)}.`,
        );
        return failed(
          "The image could not be uploaded. Check the Storage setup and try again.",
        );
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Property image upload could not reach Supabase Storage.");
      return failed("The image could not be uploaded. Try again.");
    }

    uploadedPath = imagePath;
    finalImages = [
      ...validation.values.images,
      { path: imagePath, alt: validation.imageAlt },
    ];
  }

  const propertyValues = {
    title: validation.values.title,
    slug: validation.values.slug,
    description: validation.values.description,
    location: validation.values.location,
    region: validation.values.region,
    price_kes: validation.values.priceKes,
    plot_size: validation.values.plotSize,
    status: validation.values.status,
    featured: validation.values.featured,
    is_published: validation.values.isPublished,
    images: finalImages,
  };

  let mutationError: { code?: string; message?: string } | null = null;
  let saved = false;
  try {
    if (suppliedId) {
      const { data, error } = await supabase
        .from("properties")
        .update(propertyValues)
        .eq("id", propertyId)
        .select("id")
        .maybeSingle();
      mutationError = error;
      saved = Boolean(data);
    } else {
      const { data, error } = await supabase
        .from("properties")
        .insert({ id: propertyId, ...propertyValues })
        .select("id")
        .single();
      mutationError = error;
      saved = Boolean(data);
    }
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }

    console.error("Admin property save could not be confirmed.");
    return failed(
      uploadedPath
        ? "The save could not be confirmed. The new image was kept to avoid breaking a possible saved reference. Check the property list before retrying."
        : "The save could not be confirmed. Check the property list before retrying.",
    );
  }

  if (mutationError || !saved) {
    if (mutationError) {
      console.error(
        `Admin property save failed: ${getErrorCode(mutationError)}.`,
      );
    } else {
      console.error("Admin property save returned no saved record.");
    }

    let cleanupSucceeded = true;
    if (uploadedPath) {
      cleanupSucceeded = await removeUploadedImage(supabase, uploadedPath);
    }

    if (mutationError && isDuplicateSlug(mutationError)) {
      return failed(
        cleanupSucceeded
          ? "A property already uses this slug."
          : "A property already uses this slug, and the new image could not be removed from Storage. Contact the administrator.",
        { slug: "Choose a different slug." },
      );
    }

    if (mutationError && isUnavailableRegion(mutationError)) {
      return failed(
        cleanupSucceeded
          ? "This region is no longer available. Reload the page and choose another region."
          : "The region is no longer available, and the new image could not be removed from Storage. Contact the administrator.",
        { region: "Reload the page and choose an active region." },
      );
    }

    return failed(
      cleanupSucceeded
        ? "The property was not saved. Check the values and try again."
        : "The property was not saved, and the new image could not be removed from Storage. Contact the administrator.",
    );
  }

  const finalImagePaths = new Set(finalImages.map((image) => image.path));
  const removedPaths = existingImages
    .filter((image) => !finalImagePaths.has(image.path))
    .map((image) => image.path);
  let cleanupWarning = false;

  if (removedPaths.length > 0) {
    try {
      const { error } = await supabase.storage
        .from("property-images")
        .remove(removedPaths);
      if (error) {
        console.error(
          `Removed property images cleanup failed: ${getErrorCode(error)}.`,
        );
        cleanupWarning = true;
      }
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      console.error("Removed property images cleanup could not reach Storage.");
      cleanupWarning = true;
    }
  }

  revalidatePath("/admin/properties");
  revalidatePath("/properties");
  revalidatePath("/properties/[slug]", "page");
  if (existingSlug) {
    revalidatePath(`/properties/${existingSlug}`);
  }
  if (validation.values.slug !== existingSlug) {
    revalidatePath(`/properties/${validation.values.slug}`);
  }

  if (cleanupWarning) {
    redirect(`/admin/properties/${propertyId}?saved=1&storage-warning=1`);
  }

  redirect(`/admin/properties/${propertyId}?saved=1`);
}
