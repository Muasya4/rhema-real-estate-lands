/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const articleId = "11111111-1111-4111-8111-111111111111";
const originalLoad = Module._load;
let activeClient;

Module._load = function (request, parent, isMain) {
  if (request === "../../supabase/auth-server") {
    return { createSupabaseAuthServerClient: async () => activeClient };
  }
  if (request === "../../supabase/config") {
    return {
      SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
    };
  }
  if (request === "server-only") {
    return {};
  }
  return originalLoad.call(this, request, parent, isMain);
};

const {
  getAdminJournalPost,
  getAdminJournalPosts,
} = require("../../src/lib/admin/journal/data.ts");

function createPost(overrides = {}) {
  return {
    id: articleId,
    title: "Land access in Kamakis",
    slug: "land-access-in-kamakis",
    excerpt: "Notes on access roads near Kamakis.",
    content: "<p>Details confirmed by Rhema.</p>",
    cover_image: "journal/11111111/cover.webp",
    published_at: null,
    created_at: "2026-03-10T08:00:00.000Z",
    updated_at: "2026-03-10T09:00:00.000Z",
    ...overrides,
  };
}

function mockClient(response) {
  const query = {
    selection: "",
    filters: [],
    orders: [],
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

  activeClient = {
    from(table) {
      assert.equal(table, "blog_posts");
      return query;
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "property-images");
        return {
          getPublicUrl(path) {
            return { data: { publicUrl: `https://images.example.invalid/${path}` } };
          },
        };
      },
    },
  };
  return query;
}

test("loads admin articles, including drafts and scheduled posts", async () => {
  const query = mockClient({
    data: [
      createPost({
        published_at: "2099-01-01T10:00:00.000Z",
      }),
    ],
    error: null,
  });

  const result = await getAdminJournalPosts();

  assert.equal(result.status, "success");
  assert.equal(result.posts[0].coverImageSrc, "https://images.example.invalid/journal/11111111/cover.webp");
  assert.equal(result.posts[0].publicationChoice, "scheduled");
  assert.deepEqual(query.orders, [["updated_at", { ascending: false }]]);
});

test("loads an admin article by id and returns missing records distinctly", async () => {
  const query = mockClient({ data: createPost(), error: null });
  const found = await getAdminJournalPost(articleId);

  assert.equal(found.status, "found");
  assert.equal(found.post.publishedAt, null);
  assert.equal(found.post.publicationChoice, "draft");
  assert.deepEqual(query.filters, [["id", articleId]]);

  mockClient({ data: null, error: null });
  assert.deepEqual(await getAdminJournalPost(articleId), { status: "not-found" });
  assert.deepEqual(await getAdminJournalPost("invalid"), { status: "not-found" });
});
