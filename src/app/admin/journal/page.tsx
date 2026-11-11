import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminJournalPosts } from "@/lib/admin/journal/data";
import { formatJournalDate } from "@/lib/journal/model";

export const metadata: Metadata = {
  title: "Journal | Admin",
  robots: { index: false, follow: false },
};

async function AdminJournalContent() {
  await requireAdmin();
  const result = await getAdminJournalPosts();
  const journalContent =
    result.status === "error" ? (
      <section className="admin-notice" role="alert">
        <h2>Journal articles could not be loaded.</h2>
        <p>Check the database connection and try again.</p>
      </section>
    ) : result.posts.length === 0 ? (
      <section className="admin-notice">
        <h2>No Journal articles have been added.</h2>
        <p>Create an article when its facts and publication timing are confirmed.</p>
        <Link className="button button--primary" href="/admin/journal/new">
          Add article
        </Link>
      </section>
    ) : (
      <div className="admin-property-list">
        {result.posts.map((post) => {
          const label =
            post.publicationChoice === "draft"
              ? "Draft"
              : post.publicationChoice === "scheduled"
                ? "Scheduled"
                : "Published";
          const date = post.publishedAt ?? post.updatedAt;
          return (
            <article className="admin-property-row" key={post.id}>
              <div className="admin-property-row-main">
                <p className="admin-property-location">
                  {post.publishedAt
                    ? `${label} ${formatJournalDate(date)}`
                    : `Updated ${formatJournalDate(date)}`}
                </p>
                <h2>
                  <Link href={`/admin/journal/${post.id}`}>{post.title}</Link>
                </h2>
                <p className="admin-property-slug">/journal/{post.slug}</p>
              </div>
              <div className="admin-property-row-meta">
                <span
                  className={`admin-publication-state${label === "Published" ? " admin-publication-state--published" : ""}`}
                >
                  {label}
                </span>
              </div>
              <Link
                aria-label={`Edit ${post.title}`}
                className="text-link admin-property-edit-link"
                href={`/admin/journal/${post.id}`}
              >
                Edit
              </Link>
            </article>
          );
        })}
      </div>
    );

  return (
    <>
      <header className="admin-management-header">
        <div>
          <Link className="text-link" href="/admin">
            Admin home
          </Link>
          <h1 className="route-title">Journal</h1>
          <p className="route-description">
            Manage the articles shown in Rhema&apos;s public Journal.
          </p>
        </div>
        <Link className="button button--primary" href="/admin/journal/new">
          Add article
        </Link>
      </header>
      {journalContent}
    </>
  );
}

export default function AdminJournalPage() {
  return (
    <main className="admin-management-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="admin-loading" aria-live="polite">
              Checking admin access...
            </p>
          }
        >
          <AdminJournalContent />
        </Suspense>
      </div>
    </main>
  );
}
