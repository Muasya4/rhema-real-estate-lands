import Link from "next/link";
import { Suspense } from "react";
import { PropertyCard } from "@/components/ui/cards";
import { getPublishedProperties } from "@/lib/properties/data";
import { buildPageMetadata } from "@/lib/seo/site-url";

export const metadata = buildPageMetadata({
  title: "Properties",
  description:
    "Ask Rhema Real Estates about plots in the Nairobi Metropolitan Area, Kiambu, Machakos, Kajiado and Central Kenya.",
  path: "/properties",
});

async function PropertyListingContent() {
  const result = await getPublishedProperties();

  if (result.status === "error") {
    return (
      <section
        className="route-empty-state"
        aria-labelledby="properties-error-title"
        role="alert"
      >
        <h2 id="properties-error-title">
          Rhema&apos;s property details could not be loaded.
        </h2>
        <p>
          Contact Rhema to ask about plots in the Nairobi Metropolitan Area,
          Kiambu, Machakos, Kajiado or Central Kenya.
        </p>
        <Link className="button button--primary-outlined" href="/contact">
          Contact Rhema
        </Link>
      </section>
    );
  }

  if (result.properties.length === 0) {
    return (
      <section
        className="route-empty-state"
        aria-labelledby="properties-empty-title"
      >
        <h2 id="properties-empty-title">
          Property listings are not available here yet.
        </h2>
        <p>
          Contact Rhema directly to ask about current plots and request details
          for a location.
        </p>
        <Link className="button button--primary-outlined" href="/contact">
          Enquire about plots
        </Link>
      </section>
    );
  }

  return (
    <section className="property-listing" aria-label="Published properties">
      <div className="card-grid">
        {result.properties.map((property) => (
          <PropertyCard
            key={property.id}
            href={`/properties/${property.slug}`}
            imageAlt={property.imageAlt}
            imageIsPlaceholder={property.imageIsPlaceholder}
            imageSrc={property.imageSrc}
            location={property.location}
            plotSize={property.plotSize}
            priceKes={property.priceKes}
            status={property.status}
            title={property.title}
          />
        ))}
      </div>
    </section>
  );
}

export default function PropertiesPage() {
  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <header className="route-intro">
          <h1 className="route-title">Land in Rhema&apos;s locations.</h1>
          <p className="route-description">
            Rhema Real Estates sells plots in the Nairobi Metropolitan Area,
            Kiambu, Machakos, Kajiado and Central Kenya.
          </p>
        </header>
        <Suspense
          fallback={
            <section className="route-empty-state" aria-live="polite">
              <p>Loading Rhema&apos;s published property details.</p>
            </section>
          }
        >
          <PropertyListingContent />
        </Suspense>
      </div>
    </main>
  );
}
