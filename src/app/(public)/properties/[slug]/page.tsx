import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/site/inquiry-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { JsonLd } from "@/components/seo/json-ld";
import {
  createBreadcrumbListJsonLd,
  createPropertyPlaceJsonLd,
} from "@/lib/seo/json-ld";
import { buildPageMetadata, getSiteUrl } from "@/lib/seo/site-url";
import {
  formatPropertyMetaDescription,
  formatPropertyPrice,
} from "@/lib/properties/model";
import { getPublishedPropertyBySlug } from "@/lib/properties/data";

type PropertyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedPropertyBySlug(slug);

  if (result.status !== "found") {
    return buildPageMetadata({
      title: result.status === "not-found" ? "Property not found" : "Property details",
      description: "This property page is not available.",
      path: `/properties/${encodeURIComponent(slug)}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: result.property.title,
    description: formatPropertyMetaDescription(
      result.property.location,
      result.property.description,
    ),
    path: `/properties/${encodeURIComponent(result.property.slug)}`,
    image: result.property.images.find((image) => !image.isPlaceholder)?.src,
  });
}

function PropertyDetailError() {
  return (
    <section
      className="route-empty-state property-detail-error"
      aria-labelledby="property-detail-error-title"
      role="alert"
    >
      <h1 className="section-title" id="property-detail-error-title">
        Property details could not be loaded.
      </h1>
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

function PropertyDetailContent({
  property,
}: {
  property: Extract<
    Awaited<ReturnType<typeof getPublishedPropertyBySlug>>,
    { status: "found" }
  >["property"];
}) {
  const siteUrl = getSiteUrl();
  const propertyUrl = siteUrl
    ? new URL(`/properties/${encodeURIComponent(property.slug)}`, siteUrl).toString()
    : null;

  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim() || null;
  const formConfigured = Boolean(
    siteKey &&
      process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.SUPABASE_SECRET_KEY?.trim(),
  );

  return (
    <article className="property-detail">
      {siteUrl && propertyUrl ? (
        <>
          <JsonLd
            schema={createPropertyPlaceJsonLd({
              title: property.title,
              description: property.description,
              location: property.location,
              url: propertyUrl,
              images: property.images
                .filter((image) => !image.isPlaceholder)
                .map((image) => image.src),
            })}
          />
          <JsonLd
            schema={createBreadcrumbListJsonLd([
              {
                name: "All properties",
                url: new URL("/properties", siteUrl).toString(),
              },
              { name: property.title, url: propertyUrl },
            ])}
          />
        </>
      ) : null}
      <nav aria-label="Breadcrumb" className="property-detail-breadcrumb">
        <Link className="text-link" href="/properties">
          All properties
        </Link>
      </nav>

      <header className="property-detail-header">
        <p className="property-detail-location">{property.location}</p>
        <h1 className="route-title">{property.title}</h1>
        <div className="property-detail-markers">
          {property.status ? <StatusBadge status={property.status} /> : null}
          <span className="property-detail-price">
            {formatPropertyPrice(property.priceKes)}
          </span>
        </div>
      </header>

      <section
        aria-label={`${property.title} images`}
        className={`property-detail-gallery${property.images.length === 1 ? " property-detail-gallery--single" : ""}`}
      >
        {property.images.map((image, index) => (
          <figure
            className={`property-detail-image${index === 0 ? " property-detail-image--primary" : ""}`}
            key={`${image.src}-${index}`}
          >
            <div className="property-detail-image-frame">
              <Image
                alt={image.alt}
                className="property-detail-image-content"
                fill
                preload={index === 0}
                sizes={
                  index === 0
                    ? "(max-width: 760px) 100vw, 70vw"
                    : "(max-width: 760px) 100vw, 35vw"
                }
                src={image.src}
              />
              {image.isPlaceholder ? (
                <span
                  aria-hidden="true"
                  className="property-detail-image-label"
                >
                  Illustration placeholder
                </span>
              ) : null}
            </div>
          </figure>
        ))}
      </section>

      <div className="property-detail-content">
        <section
          aria-labelledby="property-description-title"
          className="property-detail-description"
        >
          <h2 className="section-title" id="property-description-title">
            About this property
          </h2>
          <p className="property-detail-description-text">
            {property.description}
          </p>
        </section>

        <section
          aria-labelledby="property-facts-title"
          className="property-detail-facts"
        >
          <h2 className="section-title" id="property-facts-title">
            Property details
          </h2>
          <dl className="property-detail-facts-list">
            <div>
              <dt>Location</dt>
              <dd>{property.location}</dd>
            </div>
            {property.plotSize ? (
              <div>
                <dt>Plot size</dt>
                <dd>{property.plotSize}</dd>
              </div>
            ) : null}
            <div>
              <dt>Price</dt>
              <dd>{formatPropertyPrice(property.priceKes)}</dd>
            </div>
            {property.status ? (
              <div>
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={property.status} />
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="property-inquiry-title"
        className="property-detail-inquiry"
        id="property-inquiry"
      >
        <div className="property-detail-inquiry-intro">
          <h2 className="section-title" id="property-inquiry-title">
            Ask Rhema about {property.title}.
          </h2>
          <p>
            Send a private inquiry about this property. Rhema will receive the
            property reference with your message.
          </p>
        </div>
        <InquiryForm
          propertyId={property.id}
          siteKey={formConfigured ? siteKey : null}
        />
      </section>
    </article>
  );
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  await connection();
  const { slug } = await params;
  const result = await getPublishedPropertyBySlug(slug);

  if (result.status === "not-found") {
    notFound();
  }

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        {result.status === "error" ? (
          <PropertyDetailError />
        ) : (
          <PropertyDetailContent property={result.property} />
        )}
      </div>
    </main>
  );
}
