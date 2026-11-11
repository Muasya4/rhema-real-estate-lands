import Image from "next/image";
import Link from "next/link";
import {
  formatJournalDate,
  type PublicJournalPost,
} from "@/lib/journal/model";

type JournalCardProps = {
  post: PublicJournalPost & { coverImageSrc: string | null };
};

export function JournalCard({ post }: JournalCardProps) {
  return (
    <article className="journal-card">
      {post.coverImageSrc ? (
        <Link
          aria-label={`Read ${post.title}`}
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
        <p className="journal-card-date">{formatJournalDate(post.publishedAt)}</p>
        <h2>
          <Link href={`/journal/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="journal-card-excerpt">{post.excerpt}</p>
      </div>
    </article>
  );
}
