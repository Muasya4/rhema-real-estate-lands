import "server-only";

export class SupabaseConfigurationError extends Error {}

export function getSupabasePublishableKey(): string {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!key) {
    throw new SupabaseConfigurationError(
      "Missing SUPABASE_PUBLISHABLE_KEY. Add the development project's publishable key to your local .env.local file.",
    );
  }

  const isPublishableKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);

  if (!isPublishableKey && !hasLegacySupabaseRole(key, "anon")) {
    throw new SupabaseConfigurationError(
      "SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key or legacy anon key. Secret and service_role keys are not allowed.",
    );
  }

  return key;
}

export function getSupabasePublicConfig() {
  return {
    url: getSupabaseProjectUrl(),
    key: getSupabasePublishableKey(),
  };
}

export function getSupabaseProjectUrl(): string {
  const urlValue = process.env.SUPABASE_URL?.trim();

  if (!urlValue) {
    throw new SupabaseConfigurationError(
      "Missing SUPABASE_URL. Add the development project's URL to your local .env.local file.",
    );
  }

  let url: URL;

  try {
    url = new URL(urlValue);
  } catch {
    throw new SupabaseConfigurationError(
      "SUPABASE_URL must be a valid absolute URL.",
    );
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new SupabaseConfigurationError(
      "SUPABASE_URL must be an HTTP(S) project URL without credentials, query parameters, or a fragment.",
    );
  }

  return url.toString();
}

export function hasLegacySupabaseRole(
  key: string,
  expectedRole: "anon" | "service_role",
): boolean {
  const segments = key.split(".");

  if (segments.length !== 3) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(segments[1], "base64url").toString("utf8"),
    ) as { role?: unknown };

    return payload.role === expectedRole;
  } catch {
    return false;
  }
}
