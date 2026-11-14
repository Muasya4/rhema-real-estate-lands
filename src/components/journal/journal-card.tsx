import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  formatJournalDate,
  type PublicJournalPost,
} from "@/lib/journal/model";
import type { SiteContent } from "@/lib/site-content/defaults";

type JournalCardProps = {
  content: SiteContent;
  post: PublicJournalPost & { coverImageSrc: string | null };
};

export function JournalCard({ content, post }: JournalCardProps) {
  return (
    <article className="journal-card">
      {post.coverImageSrc ? (
        <Link
          aria-label={`${content["journal.readArticleLink"]} ${post.title}`}
          className="journal-card-image"
          href={`/journal/${post.slug}`}
        >
          <Image
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={post.coverImageSrc}
          />
        </Link>
      ) : null}
      <div className="journal-card-copy">
        <time className="journal-card-date" dateTime={post.publishedAt}>
          {formatJournalDate(post.publishedAt)}
        </time>
        <h2>
          <Link href={`/journal/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="journal-card-excerpt">{post.excerpt}</p>
        <Link className="journal-card-link" href={`/journal/${post.slug}`}>
          {content["journal.readArticleLink"]}
          <ArrowUpRight aria-hidden="true" size={14} />
        </Link>
      </div>
    </article>
  );
}
