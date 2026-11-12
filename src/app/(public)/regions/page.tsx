import Link from "next/link";
import { Suspense } from "react";
import { getPublicRegions } from "@/lib/regions/data";
import { buildPageMetadata } from "@/lib/seo/site-url";
import { getPublicSiteContent } from "@/lib/site-content/data";
import type { SiteContent } from "@/lib/site-content/defaults";

export async function generateMetadata() {
  const content = await getPublicSiteContent();
  return buildPageMetadata({
    title: content["regions.metaTitle"],
    description: content["regions.metaDescription"],
    path: "/regions",
  });
}

async function RegionsContent({ content }: { content: SiteContent }) {
  const result = await getPublicRegions();

  return (
    <>
      <header className="route-intro">
        <h1 className="route-title">{content["regions.title"]}</h1>
        <p className="route-description">{content["regions.intro"]}</p>
      </header>

      {result.status === "error" ? (
        <p className="region-load-error" role="alert">
          {content["regions.error"]}
        </p>
      ) : (
        <ul
          className="region-page-list"
          aria-label={content["regions.listLabel"]}
        >
          {result.regions.map((region) => (
            <li className="region-page-item" key={region.slug}>
              {region.name}
            </li>
          ))}
        </ul>
      )}

      <p className="route-follow-up">
        <Link className="home-text-link" href="/contact">
          {content["regions.contactLink"]}
        </Link>
      </p>
    </>
  );
}

export default async function RegionsPage() {
  const content = await getPublicSiteContent();

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="region-load-message" aria-live="polite">
              {content["regions.loading"]}
            </p>
          }
        >
          <RegionsContent content={content} />
        </Suspense>
      </div>
    </main>
  );
}
