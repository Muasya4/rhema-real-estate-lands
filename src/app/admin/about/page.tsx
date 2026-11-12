import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LeadershipForm } from "@/components/admin/about/leadership-form";
import { getAdminLeadershipProfile } from "@/lib/admin/about/data";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "About page | Admin",
  robots: { index: false, follow: false },
};

type AdminAboutPageProps = {
  searchParams: Promise<{ saved?: string; "storage-warning"?: string }>;
};

async function AdminAboutContent({ searchParams }: AdminAboutPageProps) {
  await requireAdmin();
  const query = await searchParams;
  const result = await getAdminLeadershipProfile();

  if (result.status === "error") {
    return (
      <section className="admin-notice" role="alert">
        <h1>CEO profile could not be loaded.</h1>
        <p>Check that the leadership profile migration is applied, then try again.</p>
        <Link className="text-link" href="/admin">
          Back to admin
        </Link>
      </section>
    );
  }

  return (
    <section className="admin-editor">
      <Link className="text-link" href="/admin">
        Admin home
      </Link>
      <h1 className="route-title">About page</h1>
      <p className="route-description">
        Edit the CEO details and portrait shown on Rhema&apos;s public About page.
      </p>
      <LeadershipForm
        imageSrc={result.imageSrc}
        profile={result.profile}
        saved={query.saved === "1"}
        storageWarning={query["storage-warning"] === "1"}
      />
    </section>
  );
}

export default function AdminAboutPage(props: AdminAboutPageProps) {
  return (
    <main className="admin-management-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="admin-loading" aria-live="polite">
              Loading CEO profile...
            </p>
          }
        >
          <AdminAboutContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
