import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { formatPropertyPrice } from "@/lib/properties/model";
import { StatusBadge } from "./status-badge";
import type { PropertyStatus } from "@/lib/properties/model";
import type { SiteContent } from "@/lib/site-content/defaults";

type PropertyCardProps = {
  href: string;
  imageAlt: string;
  imageIsPlaceholder?: boolean;
  imageSrc: string;
  location: string;
  plotSize: string | null;
  priceKes: number | null;
  status: PropertyStatus | null;
  title: string;
  content: SiteContent;
};

export function PropertyCard({
  href,
  imageAlt,
  imageIsPlaceholder = false,
  imageSrc,
  location,
  plotSize,
  priceKes,
  status,
  title,
  content,
}: PropertyCardProps) {
  return (
    <article className="property-card">
      <Link
        className="property-card__image"
        href={href}
        aria-label={`${content["properties.cardLink"]} ${title}`}
      >
        <Image
          alt={imageAlt}
          className="property-card__image-content"
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
          src={imageSrc}
        />
        {imageIsPlaceholder ? (
          <span className="property-card__image-label">
            {content["properties.cardImageLabel"]}
          </span>
        ) : null}
      </Link>
      <div className="card-body">
        <div className="card-meta">
          <span>{location}</span>
          {status ? <StatusBadge content={content} status={status} /> : null}
        </div>
        <h3 className="card-title">
          <Link className="property-card__title-link" href={href}>
            {title}
          </Link>
        </h3>
        <div className="card-detail-row">
          {plotSize ? (
            <div className="card-detail">
              <span className="token-label">
                {content["properties.cardSizeLabel"]}
              </span>
              <span className="card-detail__value">{plotSize}</span>
            </div>
          ) : null}
          <div className="card-detail">
            <span className="token-label">
              {content["properties.cardPriceLabel"]}
            </span>
            <span className="card-detail__value">
              {formatPropertyPrice(
                priceKes,
                content["properties.priceOnRequest"],
              )}
            </span>
          </div>
          <Link className="text-link" href={href}>
            {content["properties.cardLink"]}
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

type BlogCardProps = {
  category: string;
  excerpt: string;
  href: string;
  imageLabel: string;
  title: string;
};

export function BlogCard({
  category,
  excerpt,
  href,
  imageLabel,
  title,
}: BlogCardProps) {
  return (
    <article className="blog-card">
      <div className="card-image" role="img" aria-label={imageLabel}>
        {imageLabel}
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>{category}</span>
          <span>Journal specimen</span>
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{excerpt}</p>
        <Link className="text-link" href={href}>
          Read specimen
          <ArrowUpRight aria-hidden="true" size={14} />
        </Link>
      </div>
    </article>
  );
}
