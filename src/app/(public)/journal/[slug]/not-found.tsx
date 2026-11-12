import Link from "next/link";
import { getPublicSiteContent } from "@/lib/site-content/data";

export default async function JournalArticleNotFound() {
  const content = await getPublicSiteContent();

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <section
          className="route-empty-state journal-article-error"
          aria-labelledby="journal-article-not-found-title"
        >
          <h1 id="journal-article-not-found-title">
            {content["journal.notFoundTitle"]}
          </h1>
          <p>{content["journal.notFoundCopy"]}</p>
          <Link className="button button--primary-outlined" href="/journal">
            {content["journal.notFoundLink"]}
          </Link>
        </section>
      </div>
    </main>
  );
}
