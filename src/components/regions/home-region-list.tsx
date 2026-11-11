import { getPublicRegions } from "@/lib/regions/data";

export async function HomeRegionList() {
  const result = await getPublicRegions();

  if (result.status === "error") {
    return (
      <p className="region-load-error" role="alert">
        Regions could not be loaded. Try again later.
      </p>
    );
  }

  return (
    <ul className="home-region-list">
      {result.regions.map((region) => (
        <li className="home-region-item" key={region.slug}>
          {region.name}
        </li>
      ))}
    </ul>
  );
}
