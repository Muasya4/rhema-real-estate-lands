import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegionManager } from "@/components/admin/regions/region-manager";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminRegions } from "@/lib/admin/regions/data";

export const metadata: Metadata = {
  title: "Regions | Admin",
  robots: { index: false, follow: false },
};

async function AdminRegionsContent() {
  await requireAdmin();
  const result = await getAdminRegions();

  if (result.status === "error") {
    return (
      <section className="admin-notice" role="alert">
        <h1>Regions could not be loaded.</h1>
        <p>Check the database connection and try again.</p>
        <Link className="text-link" href="/admin">
          Admin home
        </Link>
      </section>
    );
  }

  return (
    <>
      <header className="admin-management-header">
        <div>
          <Link className="text-link" href="/admin">
            Admin home
          </Link>
          <h1 className="route-title">Regions</h1>
          <p className="route-description">
            Manage the regions shown in property forms and on Rhema&apos;s
            public location pages.
          </p>
        </div>
        <Link className="button button--primary-outlined" href="/admin/properties">
          Manage properties
        </Link>
      </header>
      <RegionManager regions={result.regions} />
    </>
  );
}

export default function AdminRegionsPage() {
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
          <AdminRegionsContent />
        </Suspense>
      </div>
    </main>
  );
}
