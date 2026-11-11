import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { JournalCard } from "@/components/journal/journal-card";
import { buildPageMetadata } from "@/lib/seo/site-url";
import {
  getPublishedJournalPosts,
  journalPageSize,
} from "@/lib/journal/data";

export const metadata = buildPageMetadata({
  title: "Journal",
  description:
    "Articles about land and the areas where Rhema Real Estates sells plots in Kenya.",
  path: "/journal",
});

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

function JournalIndexFallback() {
  return (
    <section className="journal-loading" aria-live="polite">
      <p>Loading Rhema&apos;s published journal articles.</p>
    </section>
  );
}

function JournalPagination({
  page,
  pageCount,
}: {
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav aria-label="Journal pages" className="journal-pagination">
      {page > 1 ? (
        <Link href={page === 2 ? "/journal" : `/journal?page=${page - 1}`}>
          Newer articles
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      <span aria-current="page">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={`/journal?page=${page + 1}`}>Older articles</Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}

async function JournalPageContent({ searchParams }: JournalPageProps) {
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
          Rhema&apos;s journal articles could not be loaded.
        </h2>
        <p>
          Contact Rhema with questions about plots in the Nairobi Metropolitan
          Area, Kiambu, Machakos, Kajiado or Central Kenya.
        </p>
        <Link className="button button--primary-outlined" href="/contact">
          Contact Rhema
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
          There are no published journal articles yet.
        </h2>
        <p>
          Rhema&apos;s journal will feature articles about the areas where it
          sells plots.
        </p>
        <Link className="button button--primary-outlined" href="/contact">
          Contact Rhema
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
            There are no journal articles on this page.
          </h2>
        </section>
        <JournalPagination page={page} pageCount={result.pageCount} />
      </>
    );
  }

  return (
    <>
      <section
        aria-label="Published journal articles"
        className="journal-listing-grid"
      >
        {result.posts.map((post) => (
          <JournalCard key={post.id} post={post} />
        ))}
      </section>
      <JournalPagination page={page} pageCount={result.pageCount} />
    </>
  );
}

export default function JournalPage({ searchParams }: JournalPageProps) {
  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <header className="route-intro">
          <h1 className="route-title">Notes on land and place.</h1>
          <p className="route-description">
            Articles about land and the areas where Rhema Real Estates sells
            plots in Kenya.
          </p>
        </header>
        <Suspense fallback={<JournalIndexFallback />}>
          <JournalPageContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
