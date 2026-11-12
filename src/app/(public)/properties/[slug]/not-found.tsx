import Link from "next/link";
import { getPublicSiteContent } from "@/lib/site-content/data";

export default async function PropertyNotFound() {
  const content = await getPublicSiteContent();

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <section
          className="route-empty-state property-detail-not-found"
          aria-labelledby="property-not-found-title"
        >
          <h1 className="section-title" id="property-not-found-title">
            {content["properties.notFoundTitle"]}
          </h1>
          <p>{content["properties.notFoundCopy"]}</p>
          <Link className="button button--primary-outlined" href="/properties">
            {content["properties.notFoundLink"]}
          </Link>
        </section>
      </div>
    </main>
  );
}
