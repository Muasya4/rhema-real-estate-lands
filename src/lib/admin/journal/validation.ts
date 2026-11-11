import {
  parseJournalCoverImage,
  sanitizeJournalContent,
} from "../../journal/model";

export type JournalPublicationChoice = "draft" | "published" | "scheduled";
export const maximumJournalTextBytes = 500 * 1024;

export function isJournalPublicationChoice(
  value: string,
): value is JournalPublicationChoice {
  return value === "draft" || value === "published" || value === "scheduled";
}

export type JournalFieldErrors = Partial<
  Record<
    "title" | "slug" | "excerpt" | "content" | "coverImage" | "coverFile" | "scheduledAt",
    string
  >
>;

export type JournalFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  publicationChoice: JournalPublicationChoice;
  scheduledAtLocal: string;
  coverFile: File | null;
};

export type JournalValidationResult =
  | { success: true; values: JournalFormValues }
  | { success: false; fieldErrors: JournalFieldErrors };

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readTrimmedString(formData: FormData, name: string): string {
  return readString(formData, name).trim();
}

function hasRenderableText(content: string): boolean {
  return sanitizeJournalContent(content).replace(/<[^>]*>/g, "").trim().length > 0;
}

export function validateJournalForm(
  formData: FormData,
): JournalValidationResult {
  const fieldErrors: JournalFieldErrors = {};
  const title = readTrimmedString(formData, "title");
  const slug = readTrimmedString(formData, "slug");
  const excerpt = readTrimmedString(formData, "excerpt");
  const content = readString(formData, "content").trim();
  const coverImageValue = readTrimmedString(formData, "coverImage");
  const publicationValue = readTrimmedString(formData, "publicationChoice");
  const scheduledAtLocal = readTrimmedString(formData, "scheduledAtLocal");

  if (!title) {
    fieldErrors.title = "Enter an article title.";
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fieldErrors.slug = "Use lowercase letters, numbers, and single hyphens.";
  }
  if (!excerpt) {
    fieldErrors.excerpt = "Enter a short article summary.";
  }
  if (!content || !hasRenderableText(content)) {
    fieldErrors.content = "Add article text using the supported markup.";
  }
  if (
    new TextEncoder().encode(`${title}${slug}${excerpt}${content}`).byteLength >
    maximumJournalTextBytes
  ) {
    fieldErrors.content = "Keep the combined article text under 500 KiB per save.";
  }

  let coverImage: string | null = null;
  if (coverImageValue) {
    try {
      coverImage = parseJournalCoverImage(coverImageValue);
    } catch (error) {
      if (!(error instanceof TypeError)) {
        throw error;
      }

      fieldErrors.coverImage = "The cover image reference is invalid. Reload the page.";
    }
  }

  let publicationChoice: JournalPublicationChoice = "draft";
  if (isJournalPublicationChoice(publicationValue)) {
    publicationChoice = publicationValue;
  } else {
    fieldErrors.scheduledAt = "Choose a valid publication setting.";
  }

  if (
    publicationChoice === "scheduled" &&
    !parseNairobiDateTime(scheduledAtLocal)
  ) {
    fieldErrors.scheduledAt = "Choose a valid future date and time in Nairobi.";
  }

  const coverFileEntries = formData.getAll("coverFile");
  const rawCoverFile = coverFileEntries[0] ?? null;
  let coverFile: File | null = null;
  if (coverFileEntries.length > 1) {
    fieldErrors.coverFile = "Choose one cover image.";
  }
  if (rawCoverFile !== null && typeof rawCoverFile !== "string") {
    if (rawCoverFile.size > 0) {
      coverFile = rawCoverFile;
    } else if (rawCoverFile.name) {
      fieldErrors.coverFile = "Choose a non-empty cover image.";
    }
  } else if (typeof rawCoverFile === "string" && rawCoverFile) {
    fieldErrors.coverFile = "Choose a cover image file.";
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    !title ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !excerpt ||
    !content ||
    !hasRenderableText(content)
  ) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    values: {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      publicationChoice,
      scheduledAtLocal,
      coverFile,
    },
  };
}

export function parseNairobiDateTime(
  value: string,
  now: number = Date.now(),
): string | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const date = new Date(localAsUtc);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute
  ) {
    return null;
  }

  const timestamp = localAsUtc - 3 * 60 * 60 * 1000;
  if (timestamp <= now) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

export function formatNairobiDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return new Date(timestamp + 3 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}
