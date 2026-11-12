import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { JournalCard } from "@/components/journal/journal-card";
import { buildPageMetadata } from "@/lib/seo/site-url";
import {
  getPublishedJournalPosts,
  journalPageSize,
} from "@/lib/journal/data";
import { getPublicSiteContent } from "@/lib/site-content/data";
import type { SiteContent } from "@/lib/site-content/defaults";

export async function generateMetadata() {
  const content = await getPublicSiteContent();
  return buildPageMetadata({
    title: content["journal.metaTitle"],
    description: content["journal.metaDescription"],
    path: "/journal",
  });
}

type JournalPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

function parsePageNumber(value: string | string[] | undefined): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

function JournalIndexFallback({ content }: { content: SiteContent }) {
  return (
    <section className="journal-loading" aria-live="polite">
      <p>{content["journal.loading"]}</p>
    </section>
  );
}

function JournalPagination({
  page,
  pageCount,
  content,
}: {
  page: number;
  pageCount: number;
  content: SiteContent;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={content["journal.paginationLabel"]}
      className="journal-pagination"
    >
      {page > 1 ? (
        <Link href={page === 2 ? "/journal" : `/journal?page=${page - 1}`}>
          {content["journal.newerArticles"]}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      <span aria-current="page">
        {content["journal.pageLabel"]} {page} {content["journal.pageOfLabel"]}{" "}
        {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={`/journal?page=${page + 1}`}>
          {content["journal.olderArticles"]}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}

async function JournalPageContent({
  searchParams,
  content,
}: JournalPageProps & { content: SiteContent }) {
  const { page: rawPage } = await searchParams;
  const page = parsePageNumber(rawPage);
  const result = await getPublishedJournalPosts(page, journalPageSize);

  if (result.status === "error") {
    return (
      <section
        className="route-empty-state"
        aria-labelledby="journal-error-title"
        role="alert"
      >
        <h2 id="journal-error-title">
          {content["journal.errorTitle"]}
        </h2>
        <p>{content["journal.errorCopy"]}</p>
        <Link className="button button--primary-outlined" href="/contact">
          {content["journal.errorLink"]}
        </Link>
      </section>
    );
  }

  if (result.total === 0) {
    return (
      <section
        className="route-empty-state"
        aria-labelledby="journal-empty-title"
      >
        <h2 id="journal-empty-title">
          {content["journal.emptyTitle"]}
        </h2>
        <p>{content["journal.emptyCopy"]}</p>
        <Link className="button button--primary-outlined" href="/contact">
          {content["journal.emptyLink"]}
        </Link>
      </section>
    );
  }

  if (result.posts.length === 0) {
    if (page > result.pageCount) {
      redirect(
        result.pageCount === 1 ? "/journal" : `/journal?page=${result.pageCount}`,
      );
    }

    return (
      <>
        <section
          className="route-empty-state"
          aria-labelledby="journal-page-empty-title"
        >
          <h2 id="journal-page-empty-title">
            {content["journal.pageEmptyTitle"]}
          </h2>
        </section>
        <JournalPagination
          content={content}
          page={page}
          pageCount={result.pageCount}
        />
      </>
    );
  }

  return (
    <>
      <section
        aria-label={content["journal.listLabel"]}
        className="journal-listing-grid"
      >
        {result.posts.map((post) => (
          <JournalCard content={content} key={post.id} post={post} />
        ))}
      </section>
      <JournalPagination
        content={content}
        page={page}
        pageCount={result.pageCount}
      />
    </>
  );
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const content = await getPublicSiteContent();

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <header className="route-intro">
          <h1 className="route-title">{content["journal.title"]}</h1>
          <p className="route-description">{content["journal.intro"]}</p>
        </header>
        <Suspense fallback={<JournalIndexFallback content={content} />}>
          <JournalPageContent content={content} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
