import type { LeadershipFieldErrors } from "./state";

export const maximumLeadershipBiographyLength = 2000;

export type LeadershipFormValues = {
  fullName: string;
  title: string;
  email: string;
  biography: string | null;
  removeImage: boolean;
  imageFile: File | null;
};

export type LeadershipValidationResult =
  | { success: true; values: LeadershipFormValues }
  | {
      success: false;
      fieldErrors: Partial<
        Record<"fullName" | "title" | "email" | "biography" | "imageFile", string>
      >;
    };

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function validateLeadershipForm(
  formData: FormData,
): LeadershipValidationResult {
  const fieldErrors: LeadershipFieldErrors = {};
  const fullName = readString(formData, "fullName").trim();
  const title = readString(formData, "title").trim();
  const email = readString(formData, "email").trim();
  const biographyValue = readString(formData, "biography").trim();
  const removeImageValue = readString(formData, "removeImage");
  const imageEntries = formData.getAll("imageFile");

  if (!fullName || fullName.length > 100) {
    fieldErrors.fullName = "Enter a name of 1 to 100 characters.";
  }
  if (!title || title.length > 100) {
    fieldErrors.title = "Enter a title of 1 to 100 characters.";
  }
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (biographyValue.length > maximumLeadershipBiographyLength) {
    fieldErrors.biography = "Keep the biography under 2,000 characters.";
  }
  if (removeImageValue && removeImageValue !== "true") {
    fieldErrors.imageFile = "Reload the page and try again.";
  }
  if (imageEntries.length > 1) {
    fieldErrors.imageFile = "Choose one portrait image.";
  }

  const rawImage = imageEntries[0] ?? null;
  let imageFile: File | null = null;
  if (rawImage !== null && typeof rawImage !== "string") {
    if (rawImage.size > 0) {
      imageFile = rawImage;
    } else if (rawImage.name) {
      fieldErrors.imageFile = "Choose a non-empty image.";
    }
  } else if (typeof rawImage === "string" && rawImage) {
    fieldErrors.imageFile = "Choose an image file.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    values: {
      fullName,
      title,
      email,
      biography: biographyValue || null,
      removeImage: removeImageValue === "true",
      imageFile,
    },
  };
}
