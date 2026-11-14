import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOutAdmin } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

async function AdminContent() {
  const admin = await requireAdmin();

  return (
    <section aria-labelledby="admin-title" className="admin-content">
      <p className="admin-account">{admin.email}</p>
      <h1 className="auth-title" id="admin-title">
        Rhema administration
      </h1>
      <p className="auth-description">
        Manage the property details and images shown on Rhema&apos;s public site.
      </p>
      <Link className="button button--primary admin-dashboard-link" href="/admin/properties">
        Manage properties
      </Link>
      <Link
        className="button button--primary-outlined admin-dashboard-link"
        href="/admin/journal"
      >
        Manage Journal
      </Link>
      <Link
        className="button button--primary-outlined admin-dashboard-link"
        href="/admin/regions"
      >
        Manage regions
      </Link>
      <Link
        className="button button--primary-outlined admin-dashboard-link"
        href="/admin/about"
      >
        Edit About page
      </Link>
      <Link
        className="button button--primary-outlined admin-dashboard-link"
        href="/admin/content"
      >
        Edit page content
      </Link>
      <form action={signOutAdmin}>
        <button className="button button--primary-outlined" type="submit">
          Sign out
        </button>
      </form>
      <Link className="text-link admin-public-link" href="/">
        View public site
      </Link>
    </section>
  );
}

export default function AdminPage() {
  return (
    <main className="auth-page" id="main-content">
      <div className="auth-panel">
        <Link aria-label="Rhema Real Estates home" className="auth-brand" href="/">
          <span>Rhema</span>
          <span>Real Estates</span>
        </Link>
        <Suspense fallback={<p className="auth-loading">Checking admin access...</p>}>
          <AdminContent />
        </Suspense>
      </div>
    </main>
  );
}
