import "server-only";

import { SupabaseConfigurationError } from "@/lib/supabase/config";

export function getAuthSiteUrl(): string {
  const configuredUrl = process.env.AUTH_SITE_URL?.trim();

  if (!configuredUrl) {
    throw new SupabaseConfigurationError(
      "Missing AUTH_SITE_URL. Configure the canonical application origin for Auth email links.",
    );
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new SupabaseConfigurationError(
      "AUTH_SITE_URL must be a valid absolute URL.",
    );
  }

  const isLocalHttp =
    process.env.NODE_ENV !== "production" &&
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(url.hostname);

  if (
    (url.protocol !== "https:" && !isLocalHttp) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new SupabaseConfigurationError(
      "AUTH_SITE_URL must be a canonical HTTPS origin. Local HTTP is allowed outside production.",
    );
  }

  return url.origin;
}
