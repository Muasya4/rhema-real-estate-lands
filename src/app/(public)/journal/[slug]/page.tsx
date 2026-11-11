import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import {
  formatJournalDate,
  formatJournalMetaDescription,
  sanitizeJournalContent,
} from "@/lib/journal/model";
import { getPublishedJournalPostBySlug } from "@/lib/journal/data";
import { createBreadcrumbListJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata, getSiteUrl } from "@/lib/seo/site-url";

type JournalArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({
  params,
}: JournalArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedJournalPostBySlug(slug);

  if (result.status !== "found") {
    return buildPageMetadata({
      title: result.status === "not-found" ? "Article not found" : "Journal article",
      description: "This journal article is not available.",
      path: `/journal/${encodeURIComponent(slug)}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: result.post.title,
    description: formatJournalMetaDescription(result.post.excerpt),
    path: `/journal/${encodeURIComponent(result.post.slug)}`,
    image: result.post.coverImageSrc ?? undefined,
    type: "article",
    publishedTime: result.post.publishedAt,
  });
}

function JournalArticleError() {
  return (
    <section
      className="route-empty-state journal-article-error"
      aria-labelledby="journal-article-error-title"
      role="alert"
    >
      <h1 id="journal-article-error-title">
        This journal article could not be loaded.
      </h1>
      <p>
        Contact Rhema with questions about plots in the areas where it sells
        land.
      </p>
      <Link className="button button--primary-outlined" href="/journal">
        Return to the journal
      </Link>
    </section>
  );
}

export default async function JournalArticlePage({
  params,
}: JournalArticlePageProps) {
  await connection();
  const { slug } = await params;
  const result = await getPublishedJournalPostBySlug(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <main className="route-page" id="main-content">
        <div className="site-width">
          <JournalArticleError />
        </div>
      </main>
    );
  }

  const { post } = result;
  const siteUrl = getSiteUrl();
  const articleUrl = siteUrl
    ? new URL(`/journal/${encodeURIComponent(post.slug)}`, siteUrl).toString()
    : null;

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        {siteUrl && articleUrl ? (
          <JsonLd
            schema={createBreadcrumbListJsonLd([
              {
                name: "All journal articles",
                url: new URL("/journal", siteUrl).toString(),
              },
              { name: post.title, url: articleUrl },
            ])}
          />
        ) : null}
        <article className="journal-article">
          <nav aria-label="Breadcrumb" className="journal-article-breadcrumb">
            <Link className="text-link" href="/journal">
              All journal articles
            </Link>
          </nav>

          <header className="journal-article-header">
            <h1 className="route-title">{post.title}</h1>
            <p className="journal-article-excerpt">{post.excerpt}</p>
            <time className="journal-article-date" dateTime={post.publishedAt}>
              {formatJournalDate(post.publishedAt)}
            </time>
          </header>

          {post.coverImageSrc ? (
            <figure className="journal-article-cover">
              <Image
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 100vw, 88vw"
                src={post.coverImageSrc}
              />
            </figure>
          ) : null}

          <div
            className="journal-article-body"
            dangerouslySetInnerHTML={{
              __html: sanitizeJournalContent(post.content),
            }}
          />
        </article>
      </div>
    </main>
  );
}
