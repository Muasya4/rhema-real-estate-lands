/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const supabaseServer = require("../../src/lib/supabase/server.ts");
const {
  getPublishedJournalPostBySlug,
  getPublishedJournalPosts,
} = require("../../src/lib/journal/data.ts");

function createPost(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Buying land in Kamakis",
    slug: "buying-land-in-kamakis",
    excerpt: "Details about land in Kamakis.",
    content: "<p>Details about access and location.</p>",
    cover_image: "journal/kamakis.webp",
    published_at: new Date().toISOString(),
    ...overrides,
  };
}

function mockSupabase(response) {
  const query = {
    filters: [],
    orders: [],
    rangeValue: null,
    selection: "",
    countOption: undefined,
    select(selection, options) {
      this.selection = selection;
      this.countOption = options?.count;
      return this;
    },
    eq(field, value) {
      this.filters.push(["eq", field, value]);
      return this;
    },
    not(field, operator, value) {
      this.filters.push(["not", field, operator, value]);
      return this;
    },
    lte(field, value) {
      this.filters.push(["lte", field, value]);
      return this;
    },
    order(field, options) {
      this.orders.push([field, options]);
      return this;
    },
    range(from, to) {
      this.rangeValue = [from, to];
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
      assert.equal(table, "blog_posts");
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

test("loads published posts newest first with bounded pagination and storage URLs", async () => {
  const query = mockSupabase({
    data: [createPost()],
    count: 25,
    error: null,
  });

  const result = await getPublishedJournalPosts(2);

  assert.equal(result.status, "success");
  assert.equal(result.posts.length, 1);
  assert.equal(result.posts[0].coverImageSrc, "https://images.example.invalid/journal/kamakis.webp");
  assert.equal(result.page, 2);
  assert.equal(result.pageCount, 3);
  assert.equal(result.total, 25);
  assert.equal(query.countOption, "exact");
  assert.deepEqual(query.rangeValue, [12, 23]);
  assert.deepEqual(
    query.filters.map(([kind, field]) => [kind, field]),
    [
      ["not", "published_at"],
      ["lte", "published_at"],
    ],
  );
  assert.deepEqual(query.orders, [
    ["published_at", { ascending: false }],
  ]);
});

test("returns a distinct empty result when no articles are published", async () => {
  mockSupabase({ data: [], count: 0, error: null });

  const result = await getPublishedJournalPosts();

  assert.deepEqual(result, {
    status: "success",
    posts: [],
    page: 1,
    pageCount: 1,
    total: 0,
  });
});

test("returns an error when the query returns a future or malformed post", async () => {
  const originalError = console.error;
  console.error = () => {};

  try {
    mockSupabase({
      data: [
        createPost({
          published_at: new Date(Date.now() + 60_000).toISOString(),
        }),
      ],
      count: 1,
      error: null,
    });
    assert.deepEqual(await getPublishedJournalPosts(), { status: "error" });
  } finally {
    console.error = originalError;
  }
});

test("returns explicit errors for database and invalid response failures", async () => {
  const originalError = console.error;
  console.error = () => {};

  try {
    mockSupabase({ data: null, count: null, error: { code: "42501" } });
    assert.deepEqual(await getPublishedJournalPosts(), { status: "error" });

    mockSupabase({ data: null, count: null, error: null });
    assert.deepEqual(await getPublishedJournalPosts(), { status: "error" });
  } finally {
    console.error = originalError;
  }
});

test("loads a published post by exact slug and maps an optional cover", async () => {
  const query = mockSupabase({
    data: createPost({ cover_image: null }),
    error: null,
  });

  const result = await getPublishedJournalPostBySlug("buying-land-in-kamakis");

  assert.equal(result.status, "found");
  assert.equal(result.post.coverImageSrc, null);
  assert.deepEqual(query.filters, [
    ["eq", "slug", "buying-land-in-kamakis"],
    ["not", "published_at", "is", null],
    ["lte", "published_at", query.filters[2][2]],
  ]);
  assert.ok(Date.parse(query.filters[2][2]) <= Date.now());
});

test("treats unknown and unpublished slugs as not found", async () => {
  mockSupabase({ data: null, error: null });

  assert.deepEqual(
    await getPublishedJournalPostBySlug("unknown-article"),
    { status: "not-found" },
  );
});

test("returns an error when the article detail query fails", async () => {
  const originalError = console.error;
  console.error = () => {};

  try {
    mockSupabase({
      data: null,
      error: { code: "42501", message: "Read failed" },
    });

    assert.deepEqual(
      await getPublishedJournalPostBySlug("unavailable-article"),
      { status: "error" },
    );
  } finally {
    console.error = originalError;
  }
});
