import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getPublishedJournalPosts } from "@/lib/journal/data";
import type { SiteContent } from "@/lib/site-content/defaults";
import { JournalCard } from "./journal-card";

function PlannedJournalTopics({ content }: { content: SiteContent }) {
  const topics = [
    content["home.plannedTopicOne"],
    content["home.plannedTopicTwo"],
    content["home.plannedTopicThree"],
  ];

  return (
    <div className="home-journal-grid">
      {topics.map((title) => {
        const topicLocation = title.startsWith("Land in ")
          ? title.slice("Land in ".length)
          : title;
        const imageAlt = `${content["home.plannedTopicImageAlt"]} ${topicLocation}`;

        return (
          <article className="home-journal-card" key={title}>
            <div className="home-journal-image">
              <Image
                src="/land-placeholder.svg"
                alt={imageAlt}
                width={800}
                height={520}
              />
              <span className="home-image-label">
                {content["home.heroImageLabel"]}
              </span>
            </div>
            <div className="home-journal-copy">
              <p className="home-journal-label">
                {content["home.plannedTopicLabel"]}
              </p>
              <h3>{title}</h3>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function HomeJournalFallback({ content }: { content: SiteContent }) {
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
            <p className="home-section-copy">{content["home.journalPlannedCopy"]}</p>
          </div>
        </div>
        <PlannedJournalTopics content={content} />
      </div>
    </section>
  );
}

async function HomeJournalContent({ content }: { content: SiteContent }) {
  const result = await getPublishedJournalPosts(1, 3);

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

  const hasPosts = result.posts.length > 0;

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
            <p className="home-section-copy">
              {hasPosts
                ? content["home.journalPublishedCopy"]
                : content["home.journalPlannedCopy"]}
            </p>
          </div>
          <Link className="home-text-link" href={hasPosts ? "/journal" : "/contact"}>
            {hasPosts
              ? content["home.journalReadLink"]
              : content["home.journalAskLink"]}
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
        {hasPosts ? (
          <div className="home-journal-grid home-journal-grid--published">
            {result.posts.map((post) => (
              <JournalCard content={content} key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <PlannedJournalTopics content={content} />
        )}
      </div>
    </section>
  );
}

export function HomeJournal({ content }: { content: SiteContent }) {
  return (
    <Suspense fallback={<HomeJournalFallback content={content} />}>
      <HomeJournalContent content={content} />
    </Suspense>
  );
}
