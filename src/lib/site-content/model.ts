import {
  SITE_CONTENT_EDITABLE_KEYS,
  SITE_CONTENT_IMAGE_KEYS,
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_KEYS,
  SITE_CONTENT_SECTIONS,
  type SiteContent,
  type SiteContentKey,
  type SiteContentImageField,
} from "./defaults";

const maximumContentLength = 2000;
const allowedKeys = new Set<string>(SITE_CONTENT_KEYS);
const editableKeys = new Set<string>(SITE_CONTENT_EDITABLE_KEYS);
const imageKeys = new Set<string>(SITE_CONTENT_IMAGE_KEYS);
const allowedSectionKeys = new Map(
  SITE_CONTENT_SECTIONS.map((section) => [
    section.id,
    new Set([
      ...section.fields.map(({ key }) => key),
      ...(section.images ?? []).map(({ key }) => key),
    ]),
  ]),
);
const sectionTextKeys = new Map(
  SITE_CONTENT_SECTIONS.map((section) => [
    section.id,
    section.fields.map(({ key }) => key),
  ]),
);
const sectionImages = new Map(
  SITE_CONTENT_SECTIONS.map((section) => [section.id, section.images ?? []]),
);
const storedImagePathPattern =
  /^site-content\/home\/(hero|portfolio)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSiteContentKey(value: string): value is SiteContentKey {
  return allowedKeys.has(value);
}

export function getSiteContentSectionKeys(sectionId: string): SiteContentKey[] | null {
  const keys = allowedSectionKeys.get(sectionId);
  return keys ? [...keys] : null;
}

export function getSiteContentSectionTextKeys(
  sectionId: string,
): SiteContentKey[] | null {
  const keys = sectionTextKeys.get(sectionId);
  return keys ? [...keys] : null;
}

export function getSiteContentSectionImages(
  sectionId: string,
): readonly SiteContentImageField[] | null {
  return sectionImages.get(sectionId) ?? null;
}

export function parseSiteContentOverrides(value: unknown): Partial<SiteContent> {
  if (!Array.isArray(value)) {
    throw new TypeError("Site content rows must be an array.");
  }

  const overrides: Partial<SiteContent> = {};
  for (const row of value) {
    if (!isRecord(row) || typeof row.content_key !== "string") {
      throw new TypeError("Site content row has an invalid key.");
    }

    if (!isSiteContentKey(row.content_key)) {
      throw new TypeError("Site content row contains an unsupported key.");
    }

    const contentValue = row.content_value;
    if (
      typeof contentValue !== "string" ||
      contentValue.trim().length === 0 ||
      contentValue.length > maximumContentLength ||
      (imageKeys.has(row.content_key) &&
        !storedImagePathPattern.test(contentValue))
    ) {
      throw new TypeError("Site content row has an invalid value.");
    }

    if (Object.hasOwn(overrides, row.content_key)) {
      throw new TypeError("Site content contains a duplicate key.");
    }

    overrides[row.content_key] = contentValue;
  }

  return overrides;
}

export function applySiteContentOverrides(
  overrides: Partial<SiteContent>,
): SiteContent {
  const editableOverrides: Partial<SiteContent> = {};
  for (const [key, value] of Object.entries(overrides)) {
    if (
      editableKeys.has(key) &&
      isSiteContentKey(key) &&
      typeof value === "string"
    ) {
      editableOverrides[key] = value;
    }
  }
  return { ...SITE_CONTENT_DEFAULTS, ...editableOverrides };
}

export function parseSiteContentSection(
  sectionId: string,
  values: Readonly<Record<string, unknown>>,
): Partial<SiteContent> {
  const sectionKeys = getSiteContentSectionTextKeys(sectionId);
  if (!sectionKeys) {
    throw new TypeError("Site content section is unsupported.");
  }

  const result: Partial<SiteContent> = {};
  for (const key of sectionKeys) {
    const value = values[key];
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      value.length > maximumContentLength
    ) {
      throw new TypeError(`Site content value for ${key} is invalid.`);
    }
    result[key] = value.trim();
  }

  return result;
}

export const siteContentFieldMaximumLength = maximumContentLength;
