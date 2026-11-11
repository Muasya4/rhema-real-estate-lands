import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guard";
import { PropertyForm } from "@/components/admin/properties/property-form";
import { getAdminRegions } from "@/lib/admin/regions/data";

export const metadata: Metadata = {
  title: "Add property | Admin",
  robots: { index: false, follow: false },
};

async function NewPropertyContent() {
  await requireAdmin();
  const regionResult = await getAdminRegions();

  if (regionResult.status === "error") {
    return (
      <section className="admin-notice" role="alert">
        <h1>Regions could not be loaded.</h1>
        <p>Check the database connection and try again.</p>
        <Link className="text-link" href="/admin/properties">
          Back to properties
        </Link>
      </section>
    );
  }

  return (
    <section className="admin-editor">
      <Link className="text-link" href="/admin/properties">
        Back to properties
      </Link>
      <h1 className="route-title">Add a property</h1>
      <p className="route-description">
        Enter details supplied for this property. New properties are drafts
        unless you choose to publish them.
      </p>
      <PropertyForm regions={regionResult.regions} />
    </section>
  );
}

export default function NewPropertyPage() {
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
          <NewPropertyContent />
        </Suspense>
      </div>
    </main>
  );
}
