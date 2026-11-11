import Link from "next/link";

export default function JournalArticleNotFound() {
  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <section
          className="route-empty-state journal-article-error"
          aria-labelledby="journal-article-not-found-title"
        >
          <h1 id="journal-article-not-found-title">
            This journal article is not available.
          </h1>
          <p>
            It may have been removed or is not published for public viewing.
          </p>
          <Link className="button button--primary-outlined" href="/journal">
            Return to the journal
          </Link>
        </section>
      </div>
    </main>
  );
}
