import {
  parsePropertyImages,
  type PropertyImage,
} from "../../properties/images";
import {
  allowedImageTypes,
  getImageExtension,
  maximumImageBytes,
  validateImageFile,
} from "../../storage/image-validation";
import {
  propertyStatuses,
  type PropertyStatus,
} from "../../properties/model";
import { isRegionSlug } from "../../regions/model";

export type PropertyRegion = string;

export type PropertyFormValues = {
  title: string;
  slug: string;
  description: string;
  location: string;
  region: PropertyRegion;
  priceKes: number | null;
  plotSize: string | null;
  status: PropertyStatus | null;
  featured: boolean;
  isPublished: boolean;
  images: PropertyImage[];
};

export type PropertyFieldErrors = Partial<
  Record<
    | "title"
    | "slug"
    | "description"
    | "location"
    | "region"
    | "priceKes"
    | "plotSize"
    | "status"
    | "featured"
    | "isPublished"
    | "images"
    | "imageFile"
    | "imageAlt",
    string
  >
>;

export type PropertyValidationResult =
  | { success: true; values: PropertyFormValues; imageFile: File | null; imageAlt: string }
  | { success: false; fieldErrors: PropertyFieldErrors };

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isPropertyRegion(value: string): value is PropertyRegion {
  return isRegionSlug(value);
}

function isPropertyStatus(value: string): value is PropertyStatus {
  return propertyStatuses.some((status) => status === value);
}

function parseImages(value: string): PropertyImage[] | null {
  try {
    return parsePropertyImages(JSON.parse(value));
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      return null;
    }

    throw error;
  }
}

export function validatePropertyForm(
  formData: FormData,
): PropertyValidationResult {
  const fieldErrors: PropertyFieldErrors = {};
  const title = readString(formData, "title");
  const slug = readString(formData, "slug");
  const description = readString(formData, "description");
  const location = readString(formData, "location");
  const regionValue = readString(formData, "region");
  const priceValue = readString(formData, "priceKes");
  const plotSizeValue = readString(formData, "plotSize");
  const statusValue = readString(formData, "status");
  const imagesValue = readString(formData, "images");
  const imageAlt = readString(formData, "imageAlt");

  if (!title) {
    fieldErrors.title = "Enter a property title.";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers, and single hyphens.";
  }
  if (!description) {
    fieldErrors.description = "Enter a property description.";
  }
  if (!location) {
    fieldErrors.location = "Enter the property's location.";
  }
  if (!isPropertyRegion(regionValue)) {
    fieldErrors.region = "Choose a region from the list.";
  }

  let priceKes: number | null = null;
  if (priceValue) {
    if (!/^\d+$/.test(priceValue)) {
      fieldErrors.priceKes = "Enter a non-negative whole KES amount.";
    } else {
      const parsedPrice = Number(priceValue);
      if (!Number.isSafeInteger(parsedPrice)) {
        fieldErrors.priceKes = "Enter an amount within the supported KES range.";
      } else {
        priceKes = parsedPrice;
      }
    }
  }

  const plotSize = plotSizeValue || null;
  const status: PropertyStatus | null = statusValue
    ? isPropertyStatus(statusValue)
      ? statusValue
      : null
    : null;
  if (statusValue && status === null) {
    fieldErrors.status = "Choose a valid property status.";
  }

  const images = parseImages(imagesValue);
  if (!images) {
    fieldErrors.images = "The image list is invalid. Reload this page and try again.";
  }

  const imageFileEntries = formData.getAll("imageFile");
  const rawImageFile = imageFileEntries[0] ?? null;
  let imageFile: File | null = null;
  if (imageFileEntries.length > 1) {
    fieldErrors.imageFile = "Add one image per save.";
  }
  if (rawImageFile !== null && typeof rawImageFile !== "string") {
    if (rawImageFile.size > 0) {
      imageFile = rawImageFile;
    } else if (rawImageFile.name) {
      fieldErrors.imageFile = "Choose a non-empty image file.";
    }
  } else if (typeof rawImageFile === "string" && rawImageFile) {
    fieldErrors.imageFile = "Choose an image file.";
  }

  if (imageFile && !imageAlt) {
    fieldErrors.imageAlt = "Add descriptive alt text for the image.";
  }
  if (!imageFile && imageAlt) {
    fieldErrors.imageAlt = "Choose an image file before adding alt text.";
  }

  const featuredValue = formData.get("featured");
  const publishedValue = formData.get("isPublished");
  if (featuredValue !== null && featuredValue !== "on") {
    fieldErrors.featured = "The featured value is invalid.";
  }
  if (publishedValue !== null && publishedValue !== "on") {
    fieldErrors.isPublished = "The publication value is invalid.";
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    !isPropertyRegion(regionValue) ||
    !images
  ) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    values: {
      title,
      slug,
      description,
      location,
      region: regionValue,
      priceKes,
      plotSize,
      status,
      featured: featuredValue === "on",
      isPublished: publishedValue === "on",
      images,
    },
    imageFile,
    imageAlt,
  };
}

export const maximumPropertyImageBytes = maximumImageBytes;
export const allowedPropertyImageTypes = allowedImageTypes;
export const validatePropertyImageFile = validateImageFile;
export const getPropertyImageExtension = getImageExtension;
