import {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_KEYS,
  SITE_CONTENT_SECTIONS,
  type SiteContent,
  type SiteContentKey,
} from "./defaults";

const maximumContentLength = 2000;
const allowedKeys = new Set<string>(SITE_CONTENT_KEYS);
const allowedSectionKeys = new Map(
  SITE_CONTENT_SECTIONS.map((section) => [
    section.id,
    new Set(section.fields.map(({ key }) => key)),
  ]),
);

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

    if (
      typeof row.content_value !== "string" ||
      row.content_value.trim().length === 0 ||
      row.content_value.length > maximumContentLength
    ) {
      throw new TypeError("Site content row has an invalid value.");
    }

    if (Object.hasOwn(overrides, row.content_key)) {
      throw new TypeError("Site content contains a duplicate key.");
    }

    overrides[row.content_key] = row.content_value;
  }

  return overrides;
}

export function applySiteContentOverrides(
  overrides: Partial<SiteContent>,
): SiteContent {
  return { ...SITE_CONTENT_DEFAULTS, ...overrides };
}

export function parseSiteContentSection(
  sectionId: string,
  values: Readonly<Record<string, unknown>>,
): Partial<SiteContent> {
  const sectionKeys = getSiteContentSectionKeys(sectionId);
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
