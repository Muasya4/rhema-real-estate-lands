export type Region = {
  slug: string;
  name: string;
  displayOrder: number;
};

export function isRegionSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRegion(value: unknown): Region {
  if (!isRecord(value)) {
    throw new TypeError("Region record must be an object.");
  }

  if (
    typeof value.slug !== "string" ||
    !isRegionSlug(value.slug) ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    typeof value.display_order !== "number" ||
    !Number.isSafeInteger(value.display_order) ||
    value.display_order < 0
  ) {
    throw new TypeError("Region record contains invalid values.");
  }

  return {
    slug: value.slug,
    name: value.name,
    displayOrder: value.display_order,
  };
}
