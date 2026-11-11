/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  formatPropertyMetaDescription,
  formatPropertyPrice,
  parsePublicPropertyDetail,
  parsePublicProperty,
} = require("../../src/lib/properties/model.ts");

function createProperty(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Quarter-acre plot",
    slug: "quarter-acre-plot",
    location: "Kamakis, Ruiru",
    price_kes: 1250000,
    plot_size: "Quarter-acre",
    status: "available",
    featured: false,
    created_at: "2026-11-08T12:00:00.000Z",
    images: [
      {
        path: "quarter-acre/front.jpg",
        alt: "Open quarter-acre plot in Kamakis",
      },
    ],
    ...overrides,
  };
}

test("parses a published property using the stored fields", () => {
  const property = parsePublicProperty(createProperty());

  assert.equal(property.title, "Quarter-acre plot");
  assert.equal(property.priceKes, 1250000);
  assert.equal(property.plotSize, "Quarter-acre");
  assert.equal(property.images[0].path, "quarter-acre/front.jpg");
});

test("preserves a missing status without implying availability", () => {
  const property = parsePublicProperty(createProperty({ status: null }));

  assert.equal(property.status, null);
});

test("accepts each canonical property status", () => {
  for (const status of ["available", "reserved", "sold"]) {
    assert.equal(parsePublicProperty(createProperty({ status })).status, status);
  }
});

test("preserves missing price, size, and imagery", () => {
  const property = parsePublicProperty(
    createProperty({
      price_kes: null,
      plot_size: null,
      images: [],
    }),
  );

  assert.equal(property.priceKes, null);
  assert.equal(property.plotSize, null);
  assert.deepEqual(property.images, []);
});

test("parses detail fields and preserves the stored image order", () => {
  const property = parsePublicPropertyDetail(
    createProperty({
      description: "A plot in Kamakis.\nSuitable for a home.",
      images: [
        { path: "quarter-acre/front.jpg", alt: "Front view" },
        { path: "quarter-acre/access-road.jpg", alt: "Access road" },
      ],
    }),
    (path) => `https://images.example.invalid/${path}`,
  );

  assert.equal(property.description, "A plot in Kamakis.\nSuitable for a home.");
  assert.deepEqual(
    property.images.map((image) => image.src),
    [
      "https://images.example.invalid/quarter-acre/front.jpg",
      "https://images.example.invalid/quarter-acre/access-road.jpg",
    ],
  );
  assert.deepEqual(
    property.images.map((image) => image.alt),
    ["Front view", "Access road"],
  );
  assert.equal(property.images[0].isPlaceholder, false);
});

test("uses a labeled local illustration when detail imagery is absent", () => {
  const property = parsePublicPropertyDetail(
    createProperty({ images: [], description: "A plot in Kamakis." }),
    () => {
      throw new Error("No Storage URL should be requested without images.");
    },
  );

  assert.deepEqual(property.images, [
    {
      src: "/land-placeholder.svg",
      alt: "Illustrated land contour placeholder, not a property photograph.",
      isPlaceholder: true,
    },
  ]);
});

test("formats a concise metadata description from stored details", () => {
  assert.equal(
    formatPropertyMetaDescription("Kamakis, Ruiru", "A quarter-acre plot."),
    "Kamakis, Ruiru. A quarter-acre plot.",
  );
  assert.equal(
    formatPropertyMetaDescription("Kamakis, Ruiru", "A".repeat(200)).length,
    160,
  );
});

test("rejects unsafe prices and unknown statuses", () => {
  assert.throws(
    () => parsePublicProperty(createProperty({ price_kes: Number.MAX_SAFE_INTEGER + 1 })),
    /whole KES value/,
  );
  assert.throws(
    () => parsePublicProperty(createProperty({ status: "pending" })),
    /status is invalid/,
  );
});

test("formats nullable whole-KES prices without inventing a value", () => {
  assert.equal(formatPropertyPrice(null), "Price on request");
  assert.equal(formatPropertyPrice(0), "KES 0");
  assert.match(formatPropertyPrice(1250000), /^KES 1,250,000$/);
});
