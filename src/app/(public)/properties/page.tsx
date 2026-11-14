import Link from "next/link";
import { Suspense } from "react";
import { PropertyCard } from "@/components/ui/cards";
import { getPublishedProperties } from "@/lib/properties/data";
import { buildPageMetadata } from "@/lib/seo/site-url";
import { getPublicSiteContent } from "@/lib/site-content/data";
import type { SiteContent } from "@/lib/site-content/defaults";

export async function generateMetadata() {
  const content = await getPublicSiteContent();
  return buildPageMetadata({
    title: content["properties.metaTitle"],
    description: content["properties.metaDescription"],
    path: "/properties",
  });
}

async function PropertyListingContent({ content }: { content: SiteContent }) {
  const result = await getPublishedProperties();

  if (result.status === "error") {
    return (
      <section
        className="route-empty-state"
        aria-labelledby="properties-error-title"
        role="alert"
      >
        <h2 id="properties-error-title">
          {content["properties.errorTitle"]}
        </h2>
        <p>{content["properties.errorCopy"]}</p>
        <Link className="button button--primary-outlined" href="/contact">
          {content["properties.errorLink"]}
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
          {content["properties.emptyTitle"]}
        </h2>
        <p>{content["properties.emptyCopy"]}</p>
        <Link className="button button--primary-outlined" href="/contact">
          {content["properties.emptyLink"]}
        </Link>
      </section>
    );
  }

  return (
    <section
      className="property-listing"
      aria-label={content["properties.listLabel"]}
    >
      <div className="card-grid">
        {result.properties.map((property) => (
          <PropertyCard
            key={property.id}
            href={`/properties/${property.slug}`}
            imageAlt={property.imageAlt}
            imageSrc={property.imageSrc}
            location={property.location}
            plotSize={property.plotSize}
            priceKes={property.priceKes}
            status={property.status}
            title={property.title}
            content={content}
          />
        ))}
      </div>
    </section>
  );
}

export default async function PropertiesPage() {
  const content = await getPublicSiteContent();

  return (
    <main className="route-page properties-page" id="main-content">
      <div className="site-width">
        <header className="route-intro route-intro--properties">
          <h1 className="route-title">{content["properties.title"]}</h1>
          <p className="route-description">{content["properties.intro"]}</p>
        </header>
        <Suspense
          fallback={
            <section className="route-empty-state" aria-live="polite">
              <p>{content["properties.loading"]}</p>
            </section>
          }
        >
          <PropertyListingContent content={content} />
        </Suspense>
      </div>
    </main>
  );
}
