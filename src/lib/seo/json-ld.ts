export type JsonLdSchema = {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export function serializeJsonLd(schema: JsonLdSchema): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export function createLocalBusinessJsonLd(siteUrl: string): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Rhema Real Estates",
    telephone: "0711634163",
    url: siteUrl,
  };
}

export function createPropertyPlaceJsonLd({
  title,
  description,
  location,
  url,
  images,
}: {
  title: string;
  description: string;
  location: string;
  url: string;
  images: string[];
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: title,
    description: `${location}. ${description}`,
    url,
    ...(images.length > 0 ? { image: images } : {}),
  };
}

export function createBreadcrumbListJsonLd(
  items: BreadcrumbItem[],
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
