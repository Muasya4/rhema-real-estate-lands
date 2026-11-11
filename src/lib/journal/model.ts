import { filterXSS } from "xss";

export type PublicJournalPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  publishedAt: string;
};

export type AdminJournalPost = Omit<PublicJournalPost, "publishedAt"> & {
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const journalContentAllowList = {
  a: ["href", "title"],
  blockquote: [],
  br: [],
  code: [],
  em: [],
  h2: [],
  h3: [],
  li: [],
  ol: [],
  p: [],
  pre: [],
  strong: [],
  ul: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`Journal ${field} must be a non-empty string.`);
  }

  return value.trim();
}

export function parseJournalCoverImage(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  const path = requiredText(value, "cover image");
  const segments = path.split("/");

  if (
    path.startsWith("/") ||
    path.includes("\\") ||
    path.includes("://") ||
    /[\u0000-\u001f\u007f]/.test(path) ||
    segments.some((segment) => segment === "" || segment === "." || segment === "..")
  ) {
    throw new TypeError("Journal cover image must be a storage path.");
  }

  return path;
}

export function parseAdminJournalPost(value: unknown): AdminJournalPost {
  if (!isRecord(value)) {
    throw new TypeError("Journal record must be an object.");
  }

  const slug = requiredText(value.slug, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new TypeError("Journal slug is invalid.");
  }

  const id = requiredText(value.id, "id");
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    throw new TypeError("Journal id is invalid.");
  }

  const publishedAt =
    value.published_at === null
      ? null
      : requiredText(value.published_at, "publication date");
  if (
    publishedAt !== null &&
    !Number.isFinite(Date.parse(publishedAt))
  ) {
    throw new TypeError("Journal publication date is invalid.");
  }

  const createdAt = requiredText(value.created_at, "creation date");
  const updatedAt = requiredText(value.updated_at, "update date");
  if (!Number.isFinite(Date.parse(createdAt)) || !Number.isFinite(Date.parse(updatedAt))) {
    throw new TypeError("Journal record dates are invalid.");
  }

  return {
    id,
    title: requiredText(value.title, "title"),
    slug,
    excerpt: requiredText(value.excerpt, "excerpt"),
    content: requiredText(value.content, "content"),
    coverImage: parseJournalCoverImage(value.cover_image),
    publishedAt,
    createdAt,
    updatedAt,
  };
}

export function parsePublicJournalPost(
  value: unknown,
  now: number = Date.now(),
): PublicJournalPost {
  if (!isRecord(value)) {
    throw new TypeError("Journal record must be an object.");
  }

  const slug = requiredText(value.slug, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new TypeError("Journal slug is invalid.");
  }

  const publishedAt = requiredText(value.published_at, "publication date");
  const publishedTime = Date.parse(publishedAt);
  if (!Number.isFinite(publishedTime) || publishedTime > now) {
    throw new TypeError("Journal publication date is invalid or in the future.");
  }

  return {
    id: requiredText(value.id, "id"),
    title: requiredText(value.title, "title"),
    slug,
    excerpt: requiredText(value.excerpt, "excerpt"),
    content: requiredText(value.content, "content"),
    coverImage: parseJournalCoverImage(value.cover_image),
    publishedAt,
  };
}

export function sanitizeJournalContent(content: string): string {
  return filterXSS(content, {
    whiteList: journalContentAllowList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
}

export function formatJournalDate(value: string): string {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    timeZone: "Africa/Nairobi",
    year: "numeric",
  }).format(new Date(value));
}

export function formatJournalMetaDescription(excerpt: string): string {
  const text = excerpt.replace(/\s+/g, " ").trim();
  const maximumLength = 160;

  if (text.length <= maximumLength) {
    return text;
  }

  return `${text.slice(0, maximumLength - 3).trimEnd()}...`;
}
