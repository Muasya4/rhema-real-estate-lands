import type { MetadataRoute } from "next";
import { connection } from "next/server";
import {
  getPublishedJournalPosts,
  journalPageSize,
} from "../lib/journal/data";
import { getPublishedProperties } from "../lib/properties/data";
import { getSiteUrl } from "../lib/seo/site-url";

const publicPaths = ["/", "/properties", "/regions", "/journal", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const siteUrl = getSiteUrl();
  if (!siteUrl) {
    throw new Error("SITE_URL is required to generate the public sitemap.");
  }

  const propertyResult = await getPublishedProperties();
  if (propertyResult.status === "error") {
    throw new Error(
      "The public sitemap could not load published properties.",
    );
  }

  const firstJournalPage = await getPublishedJournalPosts(1, journalPageSize);
  if (firstJournalPage.status === "error") {
    throw new Error("The public sitemap could not load published articles.");
  }

  const journalPosts = [...firstJournalPage.posts];
  for (let page = 2; page <= firstJournalPage.pageCount; page += 1) {
    const journalPage = await getPublishedJournalPosts(page, journalPageSize);
    if (journalPage.status === "error") {
      throw new Error("The public sitemap could not load published articles.");
    }

    journalPosts.push(...journalPage.posts);
  }

  return [
    ...publicPaths.map((path) => ({
      url: new URL(path, siteUrl).toString(),
    })),
    ...propertyResult.properties.map((property) => ({
      url: new URL(
        `/properties/${encodeURIComponent(property.slug)}`,
        siteUrl,
      ).toString(),
    })),
    ...journalPosts.map((post) => ({
      url: new URL(
        `/journal/${encodeURIComponent(post.slug)}`,
        siteUrl,
      ).toString(),
    })),
  ];
}
