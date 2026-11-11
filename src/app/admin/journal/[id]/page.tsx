import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JournalForm } from "@/components/admin/journal/journal-form";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminJournalPost } from "@/lib/admin/journal/data";

export const metadata: Metadata = {
  title: "Edit Journal article | Admin",
  robots: { index: false, follow: false },
};

type AdminJournalPostPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; "storage-warning"?: string }>;
};

async function AdminJournalPostContent({
  params,
  searchParams,
}: AdminJournalPostPageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getAdminJournalPost(id);

  if (result.status === "not-found") {
    notFound();
  }
  if (result.status === "error") {
    return (
      <section className="admin-notice" role="alert">
        <h1>Journal article could not be loaded.</h1>
        <p>Check the database connection and try again.</p>
        <Link className="text-link" href="/admin/journal">
          Back to Journal
        </Link>
      </section>
    );
  }

  return (
    <section className="admin-editor">
      <Link className="text-link" href="/admin/journal">
        Back to Journal
      </Link>
      <h1 className="route-title">Edit Journal article</h1>
      <p className="route-description">
        Update this article&apos;s text, cover image, and publication setting.
      </p>
      <JournalForm
        coverImageSrc={result.post.coverImageSrc}
        post={result.post}
        publicationChoice={result.post.publicationChoice}
        saved={query.saved === "1"}
        storageWarning={query["storage-warning"] === "1"}
      />
    </section>
  );
}

export default function AdminJournalPostPage(props: AdminJournalPostPageProps) {
  return (
    <main className="admin-management-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="admin-loading" aria-live="polite">
              Loading Journal article...
            </p>
          }
        >
          <AdminJournalPostContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
