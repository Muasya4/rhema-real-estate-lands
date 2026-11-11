import type { Metadata } from "next";

export class SiteUrlConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SiteUrlConfigurationError";
  }
}

export function getSiteUrl(): URL | null {
  const configuredUrl = process.env.SITE_URL?.trim();

  if (!configuredUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new SiteUrlConfigurationError(
        "Missing SITE_URL. Configure the canonical HTTPS origin for SEO metadata and sitemap URLs.",
      );
    }

    return null;
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new SiteUrlConfigurationError(
      "SITE_URL must be a valid absolute URL.",
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
    throw new SiteUrlConfigurationError(
      "SITE_URL must be a canonical HTTPS origin. Local HTTP is allowed outside production.",
    );
  }

  return new URL(url.origin);
}

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
};

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const canonicalUrl = siteUrl && !input.noindex
    ? new URL(input.path, siteUrl).toString()
    : undefined;
  const image = input.image?.trim() || undefined;
  const type = input.type ?? "website";
  const openGraph =
    type === "article"
      ? {
          type: "article" as const,
          siteName: "Rhema Real Estates",
          title: input.title,
          description: input.description,
          ...(canonicalUrl ? { url: canonicalUrl } : {}),
          ...(image ? { images: [image] } : {}),
          ...(input.publishedTime
            ? { publishedTime: input.publishedTime }
            : {}),
        }
      : {
          type: "website" as const,
          siteName: "Rhema Real Estates",
          title: input.title,
          description: input.description,
          ...(canonicalUrl ? { url: canonicalUrl } : {}),
          ...(image ? { images: [image] } : {}),
        };

  return {
    title: input.title,
    description: input.description,
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    openGraph,
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(image ? { images: [image] } : {}),
    },
    ...(input.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
