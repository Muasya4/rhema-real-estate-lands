import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContentManager } from "@/components/admin/site-content/content-manager";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminSiteContent } from "@/lib/site-content/data";

export const metadata: Metadata = {
  title: "Website content | Admin",
  robots: { index: false, follow: false },
};

async function AdminContent() {
  await requireAdmin();
  const result = await getAdminSiteContent();

  if (result.status === "error") {
    return (
      <section className="admin-notice" role="alert">
        <h1>Website wording could not be loaded.</h1>
        <p>
          Check that the public site content migration is applied, then reload
          this page.
        </p>
        <Link className="text-link" href="/admin">
          Back to admin
        </Link>
      </section>
    );
  }

  return (
    <section className="admin-editor site-content-editor">
      <Link className="text-link" href="/admin">
        Admin home
      </Link>
      <h1 className="route-title">Website wording</h1>
      <ContentManager content={result.content} />
    </section>
  );
}

export default function AdminContentPage() {
  return (
    <main className="admin-management-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="admin-loading" aria-live="polite">
              Loading website wording...
            </p>
          }
        >
          <AdminContent />
        </Suspense>
      </div>
    </main>
  );
}
