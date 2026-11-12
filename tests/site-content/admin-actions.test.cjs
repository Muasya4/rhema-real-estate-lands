/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");
const {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_KEYS,
  SITE_CONTENT_SECTIONS,
} = require("../../src/lib/site-content/defaults.ts");

const originalLoad = Module._load;
let currentClient;
let adminAllowed = true;
let revalidatedPaths = [];
let updatedTags = [];

Module._load = function (request, parent, isMain) {
  if (request === "../../auth/guard") {
    return {
      async requireAdmin() {
        if (!adminAllowed) throw new Error("not-admin");
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
  if (request === "../../site-content/data") {
    return { siteContentCacheTag: "public-site-content" };
  }
  if (request === "next/cache") {
    return {
      revalidatePath(path) {
        revalidatedPaths.push(path);
      },
      updateTag(tag) {
        updatedTags.push(tag);
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

function createForm(values) {
  const form = new FormData();
  for (const [name, value] of Object.entries(values)) {
    form.set(name, value);
  }
  return form;
}

function sectionForm(sectionId, overrides = {}) {
  const section = SITE_CONTENT_SECTIONS.find(({ id }) => id === sectionId);
  if (!section) throw new Error(`Unknown test section: ${sectionId}`);

  const values = { sectionId };
  for (const { key } of section.fields) {
    values[`content.${key}`] = Object.hasOwn(overrides, key)
      ? overrides[key]
      : SITE_CONTENT_DEFAULTS[key];
  }
  return createForm(values);
}

function createClient({
  saveError = null,
  resetError = null,
  returnedRows,
} = {}) {
  const calls = { upsert: [], delete: [] };
  currentClient = {
    from(table) {
      assert.equal(table, "site_content");
      let rows = [];
      return {
        upsert(values) {
          rows = values;
          calls.upsert.push(values);
          return this;
        },
        async select() {
          return {
            data:
              returnedRows ??
              rows.map(({ content_key }) => ({ content_key })),
            error: saveError,
          };
        },
        delete() {
          return this;
        },
        async in(column, values) {
          assert.equal(column, "content_key");
          calls.delete.push(values);
          return { error: resetError };
        },
      };
    },
  };
  return calls;
}

const { restoreSiteContent, saveSiteContentSection } = require(
  "../../src/lib/admin/site-content/actions.ts",
);

test("rejects content mutations from non-admin users", async () => {
  createClient();
  adminAllowed = false;
  try {
    await assert.rejects(
      saveSiteContentSection({}, sectionForm("shared")),
      (error) => error.message === "not-admin",
    );
  } finally {
    adminAllowed = true;
  }
});

test("saves all fields in a supported section and invalidates public content", async () => {
  const calls = createClient();
  revalidatedPaths = [];
  updatedTags = [];

  const result = await saveSiteContentSection(
    {},
    sectionForm("home", { "home.titleStart": "Plots across" }),
  );

  assert.equal(result.status, "success");
  assert.equal(calls.upsert[0].length, SITE_CONTENT_SECTIONS.find(({ id }) => id === "home").fields.length);
  assert.ok(
    calls.upsert[0].some(
      ({ content_key, content_value }) =>
        content_key === "home.titleStart" && content_value === "Plots across",
    ),
  );
  assert.deepEqual(updatedTags, ["public-site-content"]);
  assert.ok(revalidatedPaths.includes("/"));
  assert.ok(revalidatedPaths.includes("/admin/content"));
});

test("rejects empty fields and unsupported sections before writing", async () => {
  const calls = createClient();
  const emptyResult = await saveSiteContentSection(
    {},
    sectionForm("home", { "home.titleStart": " " }),
  );
  const unsupportedResult = await saveSiteContentSection(
    {},
    createForm({ sectionId: "unknown" }),
  );

  assert.equal(emptyResult.status, "error");
  assert.ok(emptyResult.fieldErrors["home.titleStart"]);
  assert.equal(unsupportedResult.status, "error");
  assert.equal(calls.upsert.length, 0);
});

test("does not report success when the database write fails or returns incomplete rows", async () => {
  createClient({ saveError: { code: "42501" } });
  const failedResult = await saveSiteContentSection({}, sectionForm("shared"));
  assert.equal(failedResult.status, "error");

  createClient({ returnedRows: [] });
  const incompleteResult = await saveSiteContentSection({}, sectionForm("shared"));
  assert.equal(incompleteResult.status, "error");

  const firstKey = SITE_CONTENT_SECTIONS.find(({ id }) => id === "shared").fields[0].key;
  createClient({
    returnedRows: [
      { content_key: firstKey },
      { content_key: firstKey },
    ],
  });
  const duplicateResult = await saveSiteContentSection(
    {},
    sectionForm("shared"),
  );
  assert.equal(duplicateResult.status, "error");
});

test("restores only the selected section and revalidates the site", async () => {
  const calls = createClient();
  revalidatedPaths = [];
  updatedTags = [];

  const result = await restoreSiteContent(
    {},
    createForm({ scope: "home" }),
  );

  const homeKeys = SITE_CONTENT_SECTIONS.find(({ id }) => id === "home").fields.map(
    ({ key }) => key,
  );
  assert.equal(result.status, "success");
  assert.deepEqual(calls.delete, [homeKeys]);
  assert.deepEqual(updatedTags, ["public-site-content"]);
  assert.ok(revalidatedPaths.includes("/"));
});

test("all-site restore removes only known editable keys", async () => {
  const calls = createClient();
  const result = await restoreSiteContent({}, createForm({ scope: "all" }));

  assert.equal(result.status, "success");
  assert.deepEqual(calls.delete, [SITE_CONTENT_KEYS]);
});

test("does not report a successful reset when the database rejects deletion", async () => {
  createClient({ resetError: { code: "42501" } });

  const result = await restoreSiteContent(
    {},
    createForm({ scope: "home" }),
  );

  assert.equal(result.status, "error");
});
