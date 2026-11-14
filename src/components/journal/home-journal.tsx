import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getPublishedJournalPosts } from "@/lib/journal/data";
import type { SiteContent } from "@/lib/site-content/defaults";
import { JournalCard } from "./journal-card";

async function HomeJournalContent({ content }: { content: SiteContent }) {
  const result = await getPublishedJournalPosts(1, 3);

  if (result.status === "success" && result.posts.length === 0) {
    return null;
  }

  if (result.status === "error") {
    return (
      <section
        className="home-journal"
        id="journal"
        aria-labelledby="journal-title"
      >
        <div className="home-width">
          <div className="home-regions-heading">
            <div>
              <h2 className="home-section-title" id="journal-title">
                {content["home.journalTitle"]}
              </h2>
              <p className="home-section-copy" role="alert">
                {content["home.journalErrorCopy"]}
              </p>
            </div>
            <Link className="home-text-link" href="/contact">
              {content["home.journalAskLink"]}
              <ArrowUpRight aria-hidden="true" size={14} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="home-journal"
      id="journal"
      aria-labelledby="journal-title"
    >
      <div className="home-width">
        <div className="home-regions-heading">
          <div>
            <h2 className="home-section-title" id="journal-title">
              {content["home.journalTitle"]}
            </h2>
            <p className="home-section-copy">{content["home.journalPublishedCopy"]}</p>
          </div>
          <Link className="home-text-link" href="/journal">
            {content["home.journalReadLink"]}
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
        <div className="home-journal-grid home-journal-grid--published">
          {result.posts.map((post) => (
            <JournalCard content={content} key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeJournal({ content }: { content: SiteContent }) {
  return (
    <Suspense fallback={null}>
      <HomeJournalContent content={content} />
    </Suspense>
  );
}
