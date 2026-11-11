import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminJournalPost } from "@/lib/admin/journal/data";
import {
  formatJournalDate,
  sanitizeJournalContent,
} from "@/lib/journal/model";

export const metadata: Metadata = {
  title: "Journal preview | Admin",
  robots: { index: false, follow: false },
};

type AdminJournalPreviewProps = {
  params: Promise<{ id: string }>;
};

async function AdminJournalPreviewContent({
  params,
}: AdminJournalPreviewProps) {
  await requireAdmin();
  const { id } = await params;
  const result = await getAdminJournalPost(id);

  if (result.status === "not-found") {
    notFound();
  }
  if (result.status === "error") {
    return (
      <section className="admin-notice" role="alert">
        <h1>Journal preview could not be loaded.</h1>
        <p>Check the database connection and try again.</p>
        <Link className="text-link" href={`/admin/journal/${id}`}>
          Back to the article
        </Link>
      </section>
    );
  }

  const { post } = result;
  return (
    <article className="admin-editor admin-journal-preview-page">
      <p className="admin-form-message admin-journal-preview-notice" role="status">
        Admin preview. Public visibility follows the publication date shown
        below. Drafts are not visible to public visitors.
      </p>
      <Link className="text-link" href={`/admin/journal/${post.id}`}>
        Return to editing
      </Link>
      <header className="journal-article-header">
        <h1 className="route-title">{post.title}</h1>
        <p className="journal-article-excerpt">{post.excerpt}</p>
        {post.publishedAt ? (
          <time className="journal-article-date" dateTime={post.publishedAt}>
            {formatJournalDate(post.publishedAt)}
          </time>
        ) : (
          <p className="journal-article-date">Unpublished draft</p>
        )}
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
  );
}

export default function AdminJournalPreviewPage({
  params,
}: AdminJournalPreviewProps) {
  return (
    <main className="route-page admin-journal-preview" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="admin-loading" aria-live="polite">
              Checking admin access...
            </p>
          }
        >
          <AdminJournalPreviewContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
