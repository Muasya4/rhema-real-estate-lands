import { parsePropertyImages, type PropertyImage } from "./images";

export const propertyStatuses = ["available", "reserved", "sold"] as const;

export type PropertyStatus = (typeof propertyStatuses)[number];

export type PublicProperty = {
  id: string;
  title: string;
  slug: string;
  location: string;
  priceKes: number | null;
  plotSize: string | null;
  status: PropertyStatus | null;
  featured: boolean;
  createdAt: string;
  images: PropertyImage[];
};

export type PropertyDetailImage = {
  src: string;
  alt: string;
  isPlaceholder: boolean;
};

export type PublicPropertyDetail = Omit<PublicProperty, "images"> & {
  description: string;
  images: PropertyDetailImage[];
};

function isPropertyStatus(value: unknown): value is PropertyStatus {
  return (
    typeof value === "string" &&
    propertyStatuses.some((status) => status === value)
  );
}

const kesNumberFormatter = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Property ${field} must be a non-empty string.`);
  }

  return value;
}

function nullableText(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }

  return requiredText(value, field);
}

export function parsePublicProperty(value: unknown): PublicProperty {
  if (!isRecord(value)) {
    throw new TypeError("Property record must be an object.");
  }

  const rawStatus = value.status;
  if (rawStatus !== null && !isPropertyStatus(rawStatus)) {
    throw new TypeError("Property status is invalid.");
  }
  const status: PropertyStatus | null = rawStatus;

  const priceKes = value.price_kes;
  if (
    priceKes !== null &&
    (typeof priceKes !== "number" ||
      !Number.isSafeInteger(priceKes) ||
      priceKes < 0)
  ) {
    throw new TypeError("Property price must be a non-negative whole KES value.");
  }

  const plotSize = nullableText(value.plot_size, "plot size");
  const createdAt = requiredText(value.created_at, "created_at");

  if (!Number.isFinite(Date.parse(createdAt))) {
    throw new TypeError("Property created_at must be a valid timestamp.");
  }

  if (typeof value.featured !== "boolean") {
    throw new TypeError("Property featured must be a boolean.");
  }

  const slug = requiredText(value.slug, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new TypeError("Property slug is invalid.");
  }

  return {
    id: requiredText(value.id, "id"),
    title: requiredText(value.title, "title"),
    slug,
    location: requiredText(value.location, "location"),
    priceKes,
    plotSize,
    status,
    featured: value.featured,
    createdAt,
    images: parsePropertyImages(value.images),
  };
}

export function parsePublicPropertyDetail(
  value: unknown,
  getPublicImageUrl: (path: string) => string,
): PublicPropertyDetail {
  if (!isRecord(value)) {
    throw new TypeError("Property record must be an object.");
  }

  const property = parsePublicProperty(value);
  const description = requiredText(value.description, "description");
  const images = property.images.map((image) => ({
    src: getPublicImageUrl(image.path),
    alt: image.alt,
    isPlaceholder: false,
  }));

  return {
    ...property,
    description,
    images:
      images.length > 0
        ? images
        : [
            {
              src: "/land-placeholder.svg",
              alt: "Illustrated land contour placeholder, not a property photograph.",
              isPlaceholder: true,
            },
          ],
  };
}

export function formatPropertyPrice(
  priceKes: number | null,
  priceOnRequest = "Price on request",
): string {
  if (priceKes === null) {
    return priceOnRequest;
  }

  if (!Number.isSafeInteger(priceKes) || priceKes < 0) {
    throw new TypeError("Property price must be a non-negative whole KES value.");
  }

  return `KES ${kesNumberFormatter.format(priceKes)}`;
}

export function formatPropertyMetaDescription(
  location: string,
  description: string,
): string {
  const text = `${location}. ${description.replace(/\s+/g, " ").trim()}`;
  const maximumLength = 160;

  if (text.length <= maximumLength) {
    return text;
  }

  return `${text.slice(0, maximumLength - 3).trimEnd()}...`;
}
