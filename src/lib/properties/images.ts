export type PropertyImage = {
  path: string;
  alt: string;
};

function isPropertyImage(value: unknown): value is PropertyImage {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const image = value as Record<string, unknown>;
  const keys = Object.keys(image);
  const path = typeof image.path === "string" ? image.path.trim() : "";

  return (
    keys.length === 2 &&
    keys.includes("path") &&
    keys.includes("alt") &&
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("://") &&
    typeof image.alt === "string" &&
    image.alt.trim().length > 0
  );
}

export function parsePropertyImages(value: unknown): PropertyImage[] {
  if (!Array.isArray(value)) {
    throw new TypeError("Property images must be an array.");
  }

  const images: PropertyImage[] = [];

  for (const image of value) {
    if (!isPropertyImage(image)) {
      throw new TypeError(
        "Each property image must contain only non-empty path and alt strings.",
      );
    }

    images.push(image);
  }

  return images;
}
