import Link from "next/link";
import { Suspense } from "react";
import { getPublicRegions } from "@/lib/regions/data";
import { buildPageMetadata } from "@/lib/seo/site-url";

export const metadata = buildPageMetadata({
  title: "Regions",
  description:
    "The areas where Rhema Real Estates sells land, from Nairobi and the Thika Road corridor to Central Kenya.",
  path: "/regions",
});

async function RegionsContent() {
  const result = await getPublicRegions();

  return (
    <>
      <header className="route-intro">
        <h1 className="route-title">Areas covered by Rhema.</h1>
        <p className="route-description">
          Rhema Real Estates sells plots across Nairobi, Kiambu, Machakos,
          Kajiado and Central Kenya.
        </p>
      </header>

      {result.status === "error" ? (
        <p className="region-load-error" role="alert">
          Areas could not be loaded. Try again later.
        </p>
      ) : (
        <ul className="region-page-list" aria-label="Rhema service areas">
          {result.regions.map((region) => (
            <li className="region-page-item" key={region.slug}>
              {region.name}
            </li>
          ))}
        </ul>
      )}

      <p className="route-follow-up">
        <Link className="home-text-link" href="/contact">
          Ask about a location
        </Link>
      </p>
    </>
  );
}

export default function RegionsPage() {
  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <Suspense
          fallback={
            <p className="region-load-message" aria-live="polite">
              Loading regions...
            </p>
          }
        >
          <RegionsContent />
        </Suspense>
      </div>
    </main>
  );
}
