/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  createBreadcrumbListJsonLd,
  createLocalBusinessJsonLd,
  createPropertyPlaceJsonLd,
  serializeJsonLd,
} = require("../../src/lib/seo/json-ld.ts");

test("serializes untrusted text without allowing a script-element breakout", () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: "</script><script>alert(1)</script>",
  };
  const serialized = serializeJsonLd(schema);

  assert.equal(serialized.includes("</script>"), false);
  assert.deepEqual(JSON.parse(serialized), schema);
});

test("includes only confirmed business facts and page-supported place details", () => {
  const business = createLocalBusinessJsonLd("https://rhema.example/");
  assert.deepEqual(business, {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Rhema Real Estates",
    telephone: "0711634163",
    url: "https://rhema.example/",
  });
  assert.equal("address" in business, false);
  assert.equal("openingHours" in business, false);

  const place = createPropertyPlaceJsonLd({
    title: "Kamakis plot",
    description: "Suitable for a home.",
    location: "Kamakis",
    url: "https://rhema.example/properties/kamakis-plot",
    images: ["https://images.example.invalid/kamakis.webp"],
  });
  assert.equal(place["@type"], "Place");
  assert.equal(place.description, "Kamakis. Suitable for a home.");
  assert.equal(place.image.length, 1);
});

test("builds breadcrumb JSON-LD from the visible route hierarchy", () => {
  const breadcrumb = createBreadcrumbListJsonLd([
    { name: "All properties", url: "https://rhema.example/properties" },
    {
      name: "Kamakis plot",
      url: "https://rhema.example/properties/kamakis-plot",
    },
  ]);

  assert.deepEqual(breadcrumb.itemListElement, [
    {
      "@type": "ListItem",
      position: 1,
      name: "All properties",
      item: "https://rhema.example/properties",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Kamakis plot",
      item: "https://rhema.example/properties/kamakis-plot",
    },
  ]);
});
