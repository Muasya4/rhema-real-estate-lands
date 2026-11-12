export type LeadershipProfile = {
  fullName: string;
  title: string;
  email: string;
  biography: string | null;
  imagePath: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`Leadership ${field} must be a non-empty string.`);
  }
  return value.trim();
}

export function parseLeadershipImagePath(value: unknown): string | null {
  if (value === null) return null;

  const path = requiredText(value, "image path");
  if (!/^leadership\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(path)) {
    throw new TypeError("Leadership image path is invalid.");
  }

  return path;
}

export function parseLeadershipProfile(value: unknown): LeadershipProfile {
  if (!isRecord(value) || value.profile_key !== "ceo") {
    throw new TypeError("Leadership profile record is invalid.");
  }

  const email = requiredText(value.email, "email");
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new TypeError("Leadership email is invalid.");
  }

  const fullName = requiredText(value.full_name, "name");
  const title = requiredText(value.title, "title");
  if (fullName.length > 100 || title.length > 100) {
    throw new TypeError("Leadership name or title exceeds its limit.");
  }

  const biography =
    value.biography === null || value.biography === ""
      ? null
      : requiredText(value.biography, "biography");
  if (biography && biography.length > 2000) {
    throw new TypeError("Leadership biography exceeds its limit.");
  }

  return {
    fullName,
    title,
    email,
    biography,
    imagePath: parseLeadershipImagePath(value.image_path),
  };
}
