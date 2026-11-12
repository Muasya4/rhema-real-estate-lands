import { getPublicRegions } from "@/lib/regions/data";
import type { SiteContent } from "@/lib/site-content/defaults";

export async function HomeRegionList({ content }: { content: SiteContent }) {
  const result = await getPublicRegions();

  if (result.status === "error") {
    return (
      <p className="region-load-error" role="alert">
        {content["regions.homeError"]}
      </p>
    );
  }

  return (
    <ul
      aria-label={content["home.regionListLabel"]}
      className="home-region-list"
    >
      {result.regions.map((region) => (
        <li className="home-region-item" key={region.slug}>
          {region.name}
        </li>
      ))}
    </ul>
  );
}
