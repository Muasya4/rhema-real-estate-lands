import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { JournalForm } from "@/components/admin/journal/journal-form";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Add Journal article | Admin",
  robots: { index: false, follow: false },
};

async function NewJournalPostContent() {
  await requireAdmin();

  return (
    <section className="admin-editor">
      <Link className="text-link" href="/admin/journal">
        Back to Journal
      </Link>
      <h1 className="route-title">Add a Journal article</h1>
      <p className="route-description">
        Enter details verified by Rhema. New articles stay unpublished until you
        choose a publication setting.
      </p>
      <JournalForm />
    </section>
  );
}

export default function NewJournalPostPage() {
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
          <NewJournalPostContent />
        </Suspense>
      </div>
    </main>
  );
}
