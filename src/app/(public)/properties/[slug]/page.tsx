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
import { getPublicSiteContent } from "@/lib/site-content/data";
import type { SiteContent } from "@/lib/site-content/defaults";

type PropertyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [result, content] = await Promise.all([
    getPublishedPropertyBySlug(slug),
    getPublicSiteContent(),
  ]);

  if (result.status !== "found") {
    return buildPageMetadata({
      title:
        result.status === "not-found"
          ? content["properties.metaNotFoundTitle"]
          : content["properties.metaUnavailableTitle"],
      description: content["properties.metaUnavailableDescription"],
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

function PropertyDetailError({ content }: { content: SiteContent }) {
  return (
    <section
      className="route-empty-state property-detail-error"
      aria-labelledby="property-detail-error-title"
      role="alert"
    >
      <h1 className="section-title" id="property-detail-error-title">
        {content["properties.errorDetailTitle"]}
      </h1>
      <p>{content["properties.errorDetailCopy"]}</p>
      <Link className="button button--primary-outlined" href="/contact">
        {content["properties.errorDetailLink"]}
      </Link>
    </section>
  );
}

function PropertyDetailContent({
  property,
  content,
}: {
  property: Extract<
    Awaited<ReturnType<typeof getPublishedPropertyBySlug>>,
    { status: "found" }
  >["property"];
  content: SiteContent;
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
                name: content["properties.allProperties"],
                url: new URL("/properties", siteUrl).toString(),
              },
              { name: property.title, url: propertyUrl },
            ])}
          />
        </>
      ) : null}
      <nav
        aria-label={content["properties.breadcrumbLabel"]}
        className="property-detail-breadcrumb"
      >
        <Link className="text-link" href="/properties">
          {content["properties.allProperties"]}
        </Link>
      </nav>

      <header className="property-detail-header">
        <p className="property-detail-location">{property.location}</p>
        <h1 className="route-title">{property.title}</h1>
        <div className="property-detail-markers">
          {property.status ? (
            <StatusBadge content={content} status={property.status} />
          ) : null}
          <span className="property-detail-price">
            {formatPropertyPrice(
              property.priceKes,
              content["properties.priceOnRequest"],
            )}
          </span>
        </div>
      </header>

      <section
        aria-label={`${property.title} ${content["properties.galleryLabelSuffix"]}`}
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
                  {content["properties.detailImagePlaceholder"]}
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
            {content["properties.detailAboutTitle"]}
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
            {content["properties.detailFactsTitle"]}
          </h2>
          <dl className="property-detail-facts-list">
            <div>
              <dt>{content["properties.detailLocationLabel"]}</dt>
              <dd>{property.location}</dd>
            </div>
            {property.plotSize ? (
              <div>
                <dt>{content["properties.detailSizeLabel"]}</dt>
                <dd>{property.plotSize}</dd>
              </div>
            ) : null}
            <div>
              <dt>{content["properties.detailPriceLabel"]}</dt>
              <dd>
                {formatPropertyPrice(
                  property.priceKes,
                  content["properties.priceOnRequest"],
                )}
              </dd>
            </div>
            {property.status ? (
              <div>
                <dt>{content["properties.detailStatusLabel"]}</dt>
                <dd>
                  <StatusBadge content={content} status={property.status} />
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
            {content["properties.inquiryTitlePrefix"]} {property.title}.
          </h2>
          <p>{content["properties.inquiryCopy"]}</p>
        </div>
        <InquiryForm
          content={content}
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
  const [result, content] = await Promise.all([
    getPublishedPropertyBySlug(slug),
    getPublicSiteContent(),
  ]);

  if (result.status === "not-found") {
    notFound();
  }

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        {result.status === "error" ? (
          <PropertyDetailError content={content} />
        ) : (
          <PropertyDetailContent content={content} property={result.property} />
        )}
      </div>
    </main>
  );
}
