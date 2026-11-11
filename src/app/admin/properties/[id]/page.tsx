import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PropertyForm } from "@/components/admin/properties/property-form";
import { requireAdmin } from "@/lib/auth/guard";
import { getAdminProperty } from "@/lib/admin/properties/data";
import { getAdminRegions } from "@/lib/admin/regions/data";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";
import { SupabaseConfigurationError } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Edit property | Admin",
  robots: { index: false, follow: false },
};

type AdminPropertyPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; "storage-warning"?: string }>;
};

async function AdminPropertyContent({
  params,
  searchParams,
}: AdminPropertyPageProps) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [result, regionResult] = await Promise.all([
    getAdminProperty(id),
    getAdminRegions(),
  ]);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return (
      <section className="admin-notice" role="alert">
        <h1>Property could not be loaded.</h1>
        <p>Check the database connection and try again.</p>
        <Link className="text-link" href="/admin/properties">
          Back to properties
        </Link>
      </section>
    );
  }

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

  let supabase: Awaited<ReturnType<typeof createSupabaseAuthServerClient>>;
  try {
    supabase = await createSupabaseAuthServerClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Admin property image configuration is incomplete.");
    return (
      <section className="admin-notice" role="alert">
        <h1>Property images could not be loaded.</h1>
        <p>Check the storage configuration and try again.</p>
        <Link className="text-link" href="/admin/properties">
          Back to properties
        </Link>
      </section>
    );
  }
  const imageSources = Object.fromEntries(
    result.property.images.map((image) => [
      image.path,
      supabase.storage
        .from("property-images")
        .getPublicUrl(image.path).data.publicUrl,
    ]),
  );

  return (
    <section className="admin-editor">
      <Link className="text-link" href="/admin/properties">
        Back to properties
      </Link>
      <h1 className="route-title">Edit property</h1>
      <p className="route-description">
        Update this property&apos;s recorded details, images, and publication
        state.
      </p>
      <PropertyForm
        imageSources={imageSources}
        property={result.property}
        regions={regionResult.regions}
        saved={query.saved === "1"}
        storageWarning={query["storage-warning"] === "1"}
      />
    </section>
  );
}

export default function AdminPropertyPage(props: AdminPropertyPageProps) {
  return (
    <main className="admin-management-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="admin-loading" aria-live="polite">
              Loading property...
            </p>
          }
        >
          <AdminPropertyContent {...props} />
        </Suspense>
      </div>
    </main>
  );
}
