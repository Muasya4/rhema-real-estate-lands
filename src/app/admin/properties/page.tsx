import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminProperties } from "@/lib/admin/properties/data";
import { formatPropertyPrice } from "@/lib/properties/model";

const propertyStatusLabels = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
} as const;

export const metadata: Metadata = {
  title: "Properties | Admin",
  robots: { index: false, follow: false },
};

async function AdminPropertiesContent() {
  await requireAdmin();
  const result = await getAdminProperties();

  const propertyContent =
    result.status === "error" ? (
      <section className="admin-notice" role="alert">
        <h2>Properties could not be loaded.</h2>
        <p>Check the database connection and try again.</p>
      </section>
    ) : result.properties.length === 0 ? (
      <section className="admin-notice">
        <h2>No properties have been added.</h2>
        <p>Create a property when its location and details are confirmed.</p>
        <Link className="button button--primary" href="/admin/properties/new">
          Add property
        </Link>
      </section>
    ) : (
      <div className="admin-property-list">
        {result.properties.map((property) => (
          <article className="admin-property-row" key={property.id}>
            <div className="admin-property-row-main">
              <p className="admin-property-location">
                {property.regionName}
                {property.location !== property.regionName
                  ? `, ${property.location}`
                  : ""}
              </p>
              <h2>
                <Link href={`/admin/properties/${property.id}`}>
                  {property.title}
                </Link>
              </h2>
              <p className="admin-property-slug">/{property.slug}</p>
            </div>
            <div className="admin-property-row-meta">
              <span className="admin-property-price">
                {formatPropertyPrice(property.priceKes)}
              </span>
              <span className="admin-property-status">
                {property.status
                  ? propertyStatusLabels[property.status]
                  : "Status not set"}
              </span>
              <span
                className={`admin-publication-state${property.isPublished ? " admin-publication-state--published" : ""}`}
              >
                {property.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <Link
              aria-label={`Edit ${property.title}`}
              className="text-link admin-property-edit-link"
              href={`/admin/properties/${property.id}`}
            >
              Edit
            </Link>
          </article>
        ))}
      </div>
    );

  return (
    <>
      <header className="admin-management-header">
        <div>
          <Link className="text-link" href="/admin">
            Admin home
          </Link>
          <h1 className="route-title">Properties</h1>
          <p className="route-description">
            Manage property details, images, and publication status.
          </p>
        </div>
        <Link className="button button--primary" href="/admin/properties/new">
          Add property
        </Link>
      </header>
      {propertyContent}
    </>
  );
}

export default function AdminPropertiesPage() {
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
          <AdminPropertiesContent />
        </Suspense>
      </div>
    </main>
  );
}
