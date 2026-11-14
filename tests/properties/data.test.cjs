/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const supabaseServer = require("../../src/lib/supabase/server.ts");
const {
  getPublishedProperties,
  getPublishedPropertyBySlug,
} = require("../../src/lib/properties/data.ts");

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

function mockSupabase(response) {
  const query = {
    filters: [],
    orders: [],
    selection: "",
    select(selection) {
      this.selection = selection;
      return this;
    },
    eq(field, value) {
      this.filters.push([field, value]);
      return this;
    },
    order(field, options) {
      this.orders.push([field, options]);
      return this;
    },
    maybeSingle() {
      return Promise.resolve(response);
    },
    then(resolve, reject) {
      return Promise.resolve(response).then(resolve, reject);
    },
  };

  const client = {
    from(table) {
      assert.equal(table, "properties");
      return query;
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "property-images");
        return {
          getPublicUrl(path) {
            return {
              data: {
                publicUrl: `https://images.example.invalid/${path}`,
              },
            };
          },
        };
      },
    },
  };

  supabaseServer.createSupabaseServerClient = () => client;
  return query;
}

test("loads published properties through the anonymous client and maps storage images", async () => {
  const query = mockSupabase({
    data: [createProperty()],
    error: null,
  });

  const result = await getPublishedProperties();

  assert.equal(result.status, "success");
  assert.equal(result.properties.length, 1);
  assert.equal(
    result.properties[0].imageSrc,
    "https://images.example.invalid/quarter-acre/front.jpg",
  );
  assert.equal(result.properties[0].imageAlt, "Open quarter-acre plot in Kamakis");
  assert.deepEqual(query.filters, [["is_published", true]]);
  assert.deepEqual(
    query.orders,
    [
      ["featured", { ascending: false }],
      ["created_at", { ascending: false }],
    ],
  );
});

test("does not add fallback artwork when a published record has no images", async () => {
  mockSupabase({
    data: [createProperty({ images: [] })],
    error: null,
  });

  const result = await getPublishedProperties();

  assert.equal(result.status, "success");
  assert.equal(result.properties[0].imageSrc, null);
  assert.equal(result.properties[0].imageAlt, null);
});

test("returns a distinct successful empty result", async () => {
  mockSupabase({ data: [], error: null });

  const result = await getPublishedProperties();

  assert.deepEqual(result, { status: "success", properties: [] });
});

test("returns a failure for database and invalid-record responses", async () => {
  const originalError = console.error;
  console.error = () => {};

  try {
    mockSupabase({ data: null, error: { code: "42501" } });
    assert.deepEqual(await getPublishedProperties(), { status: "error" });

    mockSupabase({
      data: [createProperty({ status: "unknown" })],
      error: null,
    });
    assert.deepEqual(await getPublishedProperties(), { status: "error" });
  } finally {
    console.error = originalError;
  }
});

test("returns a failure when the property request cannot reach the database", async () => {
  const query = mockSupabase({ data: [], error: null });
  query.then = (resolve, reject) =>
    Promise.reject(new TypeError("fetch failed")).then(resolve, reject);

  const originalError = console.error;
  console.error = () => {};

  try {
    assert.deepEqual(await getPublishedProperties(), { status: "error" });
  } finally {
    console.error = originalError;
  }
});

test("loads one published property by exact slug and maps its detail", async () => {
  const query = mockSupabase({
    data: createProperty({
      description: "A plot in Kamakis.",
      images: [
        { path: "quarter-acre/front.jpg", alt: "Front view" },
        { path: "quarter-acre/access-road.jpg", alt: "Access road" },
      ],
    }),
    error: null,
  });

  const result = await getPublishedPropertyBySlug("quarter-acre-plot");

  assert.equal(result.status, "found");
  assert.equal(result.property.slug, "quarter-acre-plot");
  assert.equal(result.property.description, "A plot in Kamakis.");
  assert.deepEqual(query.filters, [
    ["slug", "quarter-acre-plot"],
    ["is_published", true],
  ]);
  assert.deepEqual(
    result.property.images.map((image) => image.src),
    [
      "https://images.example.invalid/quarter-acre/front.jpg",
      "https://images.example.invalid/quarter-acre/access-road.jpg",
    ],
  );
});

test("treats unknown and unpublished slugs as not found", async () => {
  mockSupabase({ data: null, error: null });

  assert.deepEqual(
    await getPublishedPropertyBySlug("unknown-property"),
    { status: "not-found" },
  );
});

test("returns an error when the property detail query fails", async () => {
  mockSupabase({
    data: null,
    error: { code: "42501", message: "Read failed" },
  });

  const originalError = console.error;
  console.error = () => {};

  try {
    assert.deepEqual(
      await getPublishedPropertyBySlug("quarter-acre-plot"),
      { status: "error" },
    );
  } finally {
    console.error = originalError;
  }
});

test("returns an error for an invalid detail record", async () => {
  mockSupabase({
    data: createProperty({ description: "" }),
    error: null,
  });

  const originalError = console.error;
  console.error = () => {};

  try {
    assert.deepEqual(
      await getPublishedPropertyBySlug("quarter-acre-plot"),
      { status: "error" },
    );
  } finally {
    console.error = originalError;
  }
});
