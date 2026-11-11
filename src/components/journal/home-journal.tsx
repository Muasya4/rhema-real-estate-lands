import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { getPublishedJournalPosts } from "@/lib/journal/data";
import { JournalCard } from "./journal-card";

function PlannedJournalTopics() {
  const topics = [
    {
      imageAlt:
        "Temporary image for a planned journal topic about the Nairobi Metropolitan Area",
      title: "Land in the Nairobi Metropolitan Area",
    },
    {
      imageAlt:
        "Temporary image for a planned journal topic about Kiambu County",
      title: "Land in Kiambu County",
    },
    {
      imageAlt:
        "Temporary image for a planned journal topic about Central Kenya",
      title: "Land in Central Kenya",
    },
  ];

  return (
    <div className="home-journal-grid">
      {topics.map((topic) => (
        <article className="home-journal-card" key={topic.title}>
          <div className="home-journal-image">
            <Image
              src="/land-placeholder.svg"
              alt={topic.imageAlt}
              width={800}
              height={520}
            />
            <span className="home-image-label">Temporary land image</span>
          </div>
          <div className="home-journal-copy">
            <p className="home-journal-label">Planned journal topic</p>
            <h3>{topic.title}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}

function HomeJournalFallback() {
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
              Notes on land and place.
            </h2>
            <p className="home-section-copy">
              Future journal topics will focus on regions where Rhema sells
              land. These are planned topics, not published articles.
            </p>
          </div>
        </div>
        <PlannedJournalTopics />
      </div>
    </section>
  );
}

async function HomeJournalContent() {
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
                Notes on land and place.
              </h2>
              <p className="home-section-copy" role="alert">
                Rhema&apos;s published journal articles could not be loaded.
              </p>
            </div>
            <Link className="home-text-link" href="/contact">
              Ask Rhema a question
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
              Notes on land and place.
            </h2>
            <p className="home-section-copy">
              {hasPosts
                ? "Articles about land and the areas where Rhema sells plots."
                : "Future journal topics will focus on regions where Rhema sells land. These are planned topics, not published articles."}
            </p>
          </div>
          <Link className="home-text-link" href={hasPosts ? "/journal" : "/contact"}>
            {hasPosts ? "Read the journal" : "Ask Rhema a question"}
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
        {hasPosts ? (
          <div className="home-journal-grid home-journal-grid--published">
            {result.posts.map((post) => (
              <JournalCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <PlannedJournalTopics />
        )}
      </div>
    </section>
  );
}

export function HomeJournal() {
  return (
    <Suspense fallback={<HomeJournalFallback />}>
      <HomeJournalContent />
    </Suspense>
  );
}
