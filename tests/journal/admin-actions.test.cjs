/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
const articleId = "11111111-1111-4111-8111-111111111111";
let currentClient;
let adminAllowed = true;
let revalidatedPaths;

class RedirectSignal extends Error {
  constructor(destination) {
    super(destination);
    this.destination = destination;
  }
}

Module._load = function (request, parent, isMain) {
  if (request === "../../auth/guard") {
    return {
      async requireAdmin() {
        if (!adminAllowed) {
          throw new Error("not-admin");
        }
      },
    };
  }
  if (request === "../../supabase/auth-server") {
    return { createSupabaseAuthServerClient: async () => currentClient };
  }
  if (request === "../../supabase/config") {
    return {
      SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
    };
  }
  if (request === "next/cache") {
    return {
      revalidatePath(path) {
        revalidatedPaths.push(path);
      },
    };
  }
  if (request === "next/navigation") {
    return {
      redirect(destination) {
        throw new RedirectSignal(destination);
      },
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

function formData(overrides = {}) {
  const form = new FormData();
  const values = {
    title: "Land access in Kamakis",
    slug: "land-access-in-kamakis",
    excerpt: "Notes on access roads near Kamakis.",
    content: "<p>Details confirmed by Rhema.</p>",
    coverImage: "",
    publicationChoice: "draft",
    scheduledAtLocal: "",
    ...overrides,
  };
  for (const [name, value] of Object.entries(values)) {
    form.set(name, value);
  }
  return form;
}

function createClient({
  existing = null,
  insertError = null,
  updateError = null,
  uploadError = null,
  removeError = null,
} = {}) {
  const calls = { insert: [], update: [], upload: [], remove: [] };
  let operation = "select";
  currentClient = {
    from(table) {
      assert.equal(table, "blog_posts");
      operation = "select";
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle() {
          if (operation === "select") {
            return Promise.resolve({ data: existing, error: null });
          }
          return Promise.resolve({
            data: updateError ? null : { id: articleId },
            error: updateError,
          });
        },
        single() {
          return Promise.resolve({
            data: insertError ? null : { id: articleId },
            error: insertError,
          });
        },
        update(values) {
          operation = "update";
          calls.update.push(values);
          return this;
        },
        insert(values) {
          operation = "insert";
          calls.insert.push(values);
          return this;
        },
      };
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "property-images");
        return {
          async upload(path, file, options) {
            calls.upload.push({ path, file, options });
            return { error: uploadError };
          },
          async remove(paths) {
            calls.remove.push(paths);
            return { error: removeError };
          },
        };
      },
    },
  };
  return calls;
}

const actions = require("../../src/lib/admin/journal/actions.ts");

test("rejects direct mutations from non-admin users", async () => {
  createClient();
  adminAllowed = false;
  await assert.rejects(
    actions.saveJournalPost({}, formData()),
    (error) => error.message === "not-admin",
  );
  adminAllowed = true;
});

test("creates a draft and revalidates the Journal routes", async () => {
  const calls = createClient();
  revalidatedPaths = [];

  await assert.rejects(
    actions.saveJournalPost({}, formData({ slug: "" })),
    (error) =>
      error instanceof RedirectSignal &&
      error.destination === `/admin/journal/${calls.insert[0].id}?saved=1` &&
      calls.insert[0].slug === "land-access-in-kamakis" &&
      calls.insert[0].published_at === null,
  );
  assert.ok(revalidatedPaths.includes("/journal"));
  assert.ok(revalidatedPaths.includes("/journal/[slug]"));
});

test("preserves an existing publication date on edits and allows unpublishing", async () => {
  const existing = {
    slug: "old-title",
    cover_image: null,
    published_at: "2025-01-01T10:00:00.000Z",
  };
  const calls = createClient({ existing });
  revalidatedPaths = [];

  await assert.rejects(
    actions.saveJournalPost(
      {},
      formData({
        id: articleId,
        title: "Updated article title",
        slug: "updated-article-title",
        publicationChoice: "published",
      }),
    ),
    (error) =>
      error instanceof RedirectSignal &&
      calls.update[0].published_at === existing.published_at,
  );

  const unpublishCalls = createClient({ existing });
  await assert.rejects(
    actions.saveJournalPost(
      {},
      formData({
        id: articleId,
        slug: "updated-article-title",
        publicationChoice: "draft",
      }),
    ),
    (error) =>
      error instanceof RedirectSignal &&
      unpublishCalls.update[0].published_at === null,
  );
});

test("schedules future Nairobi time and rejects duplicate slugs", async () => {
  const scheduledCalls = createClient();
  await assert.rejects(
    actions.saveJournalPost(
      {},
      formData({
        publicationChoice: "scheduled",
        scheduledAtLocal: "2099-01-01T10:00",
      }),
    ),
    (error) =>
      error instanceof RedirectSignal &&
      scheduledCalls.insert[0].published_at === "2099-01-01T07:00:00.000Z",
  );

  createClient({
    insertError: {
      code: "23505",
      message: 'duplicate key violates unique constraint "blog_posts_slug_key"',
    },
  });
  const duplicate = await actions.saveJournalPost(
    {},
    formData(),
  );
  assert.equal(duplicate.status, "error");
  assert.equal(duplicate.fieldErrors.slug, "Choose a different slug.");
});

test("reports cover upload failures without writing the article", async () => {
  const calls = createClient({ uploadError: { statusCode: "403" } });
  const form = formData();
  form.set(
    "coverFile",
    new File([Uint8Array.of(0xff, 0xd8, 0xff, 0x00)], "cover.jpg", {
      type: "image/jpeg",
    }),
  );

  const result = await actions.saveJournalPost({}, form);
  assert.equal(result.status, "error");
  assert.match(result.message, /cover image could not be uploaded/i);
  assert.equal(calls.insert.length, 0);
});

test("cleans up an uploaded cover after a failed write and reports cleanup failure", async () => {
  const calls = createClient({
    insertError: { code: "42501", message: "write denied" },
    removeError: { statusCode: "403" },
  });
  const form = formData();
  form.set(
    "coverFile",
    new File([Uint8Array.of(0xff, 0xd8, 0xff, 0x00)], "cover.jpg", {
      type: "image/jpeg",
    }),
  );

  const result = await actions.saveJournalPost({}, form);
  assert.equal(result.status, "error");
  assert.match(result.message, /new cover could not be removed/i);
  assert.equal(calls.remove.length, 1);
});

test("replaces a cover only after a successful write and removes the old file", async () => {
  const existingCover = "journal/old/cover.webp";
  const calls = createClient({
    existing: {
      slug: "land-access-in-kamakis",
      cover_image: existingCover,
      published_at: null,
    },
  });
  const form = formData({
    id: articleId,
    coverImage: existingCover,
  });
  form.set(
    "coverFile",
    new File([Uint8Array.of(0xff, 0xd8, 0xff, 0x00)], "cover.jpg", {
      type: "image/jpeg",
    }),
  );

  await assert.rejects(
    actions.saveJournalPost({}, form),
    (error) =>
      error instanceof RedirectSignal &&
      calls.upload[0].path.startsWith(`journal/${articleId}/`) &&
      calls.remove.length === 1 &&
      calls.remove[0][0] === existingCover,
  );
});

test("reports a warning when a replaced cover cannot be removed", async () => {
  const existingCover = "journal/old/cover.webp";
  const calls = createClient({
    existing: {
      slug: "land-access-in-kamakis",
      cover_image: existingCover,
      published_at: null,
    },
    removeError: { statusCode: "403" },
  });
  const form = formData({
    id: articleId,
    coverImage: existingCover,
  });
  form.set(
    "coverFile",
    new File([Uint8Array.of(0xff, 0xd8, 0xff, 0x00)], "cover.jpg", {
      type: "image/jpeg",
    }),
  );

  await assert.rejects(
    actions.saveJournalPost({}, form),
    (error) =>
      error instanceof RedirectSignal &&
      error.destination.endsWith("?saved=1&storage-warning=1") &&
      calls.remove.length === 1,
  );
});

test("removes a cover when explicitly cleared and reports failed writes", async () => {
  const existingCover = "journal/old/cover.webp";
  const removalCalls = createClient({
    existing: {
      slug: "land-access-in-kamakis",
      cover_image: existingCover,
      published_at: null,
    },
  });
  await assert.rejects(
    actions.saveJournalPost(
      {},
      formData({
        id: articleId,
        coverImage: "",
      }),
    ),
    (error) =>
      error instanceof RedirectSignal &&
      removalCalls.update[0].cover_image === null &&
      removalCalls.remove[0][0] === existingCover,
  );

  const failedWriteCalls = createClient({
    insertError: { code: "42501", message: "write denied" },
  });
  const failure = await actions.saveJournalPost({}, formData());
  assert.equal(failure.status, "error");
  assert.match(failure.message, /article was not saved/i);
  assert.equal(failedWriteCalls.insert.length, 1);
});
