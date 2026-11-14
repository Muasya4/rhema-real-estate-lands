/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");
const {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_SECTIONS,
} = require("../../src/lib/site-content/defaults.ts");
const {
  getSiteContentSectionImages,
} = require("../../src/lib/site-content/model.ts");
const siteImageValidation = require("../../src/lib/storage/image-validation.ts");
const { validateImageFile } = siteImageValidation;

const originalLoad = Module._load;
let currentClient;
let adminAllowed = true;
let revalidatedPaths = [];
let updatedTags = [];

Module._load = function (request, parent, isMain) {
  if (request === "../../storage/image-validation") {
    return siteImageValidation;
  }
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

function sectionForm(sectionId, overrides = {}, files = {}) {
  const section = SITE_CONTENT_SECTIONS.find(({ id }) => id === sectionId);
  if (!section) throw new Error(`Unknown test section: ${sectionId}`);

  const values = { sectionId };
  for (const { key } of section.fields) {
    values[`content.${key}`] = Object.hasOwn(overrides, key)
      ? overrides[key]
      : SITE_CONTENT_DEFAULTS[key];
  }
  const form = createForm(values);
  for (const [name, file] of Object.entries(files)) {
    form.set(name, file);
  }
  return form;
}

function createClient({
  saveError = null,
  resetError = null,
  returnedRows,
  imageRows = [],
  imageReadError = null,
  uploadError = null,
  removeError = null,
} = {}) {
  const calls = { upsert: [], delete: [], upload: [], remove: [] };
  currentClient = {
    from(table) {
      assert.equal(table, "site_content");
      let rows = [];
      let mode = "read";
      return {
        upsert(values) {
          mode = "upsert";
          rows = values;
          calls.upsert.push(values);
          return this;
        },
        select() {
          if (mode !== "upsert") mode = "read";
          return this;
        },
        async then(resolve, reject) {
          return Promise.resolve({
            data:
              returnedRows ??
              rows.map(({ content_key }) => ({ content_key })),
            error: saveError,
          }).then(resolve, reject);
        },
        async in(column, values) {
          assert.equal(column, "content_key");
          if (mode === "read") {
            return {
              data: imageRows.filter((row) => values.includes(row.content_key)),
              error: imageReadError,
            };
          }
          calls.delete.push(values);
          return {
            error: resetError,
          };
        },
        delete() {
          mode = "delete";
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

const { restoreSiteContent, saveSiteContentSection } = require(
  "../../src/lib/admin/site-content/actions.ts",
);

test("rejects content mutations from non-admin users", async () => {
  createClient();
  adminAllowed = false;
  try {
    await assert.rejects(
      saveSiteContentSection({}, sectionForm("home-hero")),
      (error) => error.message === "not-admin",
    );
  } finally {
    adminAllowed = true;
  }
});

test("saves only approved editorial fields and invalidates public content", async () => {
  const calls = createClient();
  revalidatedPaths = [];
  updatedTags = [];

  const result = await saveSiteContentSection(
    {},
    sectionForm("home-hero", { "home.title": "Plots across Nairobi." }),
  );

  assert.equal(result.status, "success");
  assert.equal(
    calls.upsert[0].length,
    SITE_CONTENT_SECTIONS.find(({ id }) => id === "home-hero").fields.length,
  );
  assert.ok(
    calls.upsert[0].some(
      ({ content_key, content_value }) =>
        content_key === "home.title" && content_value === "Plots across Nairobi.",
    ),
  );
  assert.deepEqual(updatedTags, ["public-site-content"]);
  assert.ok(revalidatedPaths.includes("/"));
  assert.ok(revalidatedPaths.includes("/admin/content"));
});

test("rejects empty fields and protected or unsupported sections before writing", async () => {
  const calls = createClient();
  const emptyResult = await saveSiteContentSection(
    {},
    sectionForm("home-hero", { "home.title": " " }),
  );
  const unsupportedResult = await saveSiteContentSection(
    {},
    createForm({ sectionId: "shared" }),
  );

  assert.equal(emptyResult.status, "error");
  assert.ok(emptyResult.fieldErrors["home.title"]);
  assert.equal(unsupportedResult.status, "error");
  assert.equal(calls.upsert.length, 0);
});

test("does not report success when the database write fails or returns incomplete rows", async () => {
  createClient({ saveError: { code: "42501" } });
  const failedResult = await saveSiteContentSection({}, sectionForm("home-hero"));
  assert.equal(failedResult.status, "error");

  createClient({ returnedRows: [] });
  const incompleteResult = await saveSiteContentSection({}, sectionForm("home-hero"));
  assert.equal(incompleteResult.status, "error");

  const firstKey = SITE_CONTENT_SECTIONS.find(({ id }) => id === "home-hero").fields[0].key;
  createClient({
    returnedRows: [
      { content_key: firstKey },
      { content_key: firstKey },
    ],
  });
  const duplicateResult = await saveSiteContentSection(
    {},
    sectionForm("home-hero"),
  );
  assert.equal(duplicateResult.status, "error");
});

test("restores only the selected section and revalidates the site", async () => {
  const calls = createClient();
  revalidatedPaths = [];
  updatedTags = [];

  const result = await restoreSiteContent(
    {},
    createForm({ scope: "home-hero" }),
  );

  const homeKeys = [
    ...SITE_CONTENT_SECTIONS.find(({ id }) => id === "home-hero").fields.map(
      ({ key }) => key,
    ),
    ...SITE_CONTENT_SECTIONS.find(({ id }) => id === "home-hero").images.map(
      ({ key }) => key,
    ),
  ];
  assert.equal(result.status, "success");
  assert.deepEqual(calls.delete, [homeKeys]);
  assert.deepEqual(updatedTags, ["public-site-content"]);
  assert.ok(revalidatedPaths.includes("/"));
});

test("all-site restore is no longer an available reset scope", async () => {
  const calls = createClient();
  const result = await restoreSiteContent({}, createForm({ scope: "all" }));

  assert.equal(result.status, "error");
  assert.deepEqual(calls.delete, []);
});

test("does not report a successful reset when the database rejects deletion", async () => {
  createClient({ resetError: { code: "42501" } });

  const result = await restoreSiteContent(
    {},
    createForm({ scope: "home-hero" }),
  );

  assert.equal(result.status, "error");
});

test("uploads a homepage image only after validating its alt text and stores its generated path", async () => {
  const oldPath =
    "site-content/home/hero/12345678-1234-1234-1234-123456789abc.jpg";
  const calls = createClient({
    imageRows: [
      { content_key: "home.heroImagePath", content_value: oldPath },
    ],
  });
  const file = new File(
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    "land.png",
    { type: "image/png" },
  );

  const result = await saveSiteContentSection(
    {},
    sectionForm(
      "home-hero",
      { "home.heroImageAlt": "Open land beside a road in Kamakis" },
      { "image.home.heroImagePath": file },
    ),
  );

  assert.equal(result.status, "success");
  assert.equal(calls.upload.length, 1);
  assert.match(calls.upload[0].path, /^site-content\/home\/hero\/[0-9a-f-]+\.png$/);
  assert.ok(
    calls.upsert[0].some(
      ({ content_key, content_value }) =>
        content_key === "home.heroImagePath" &&
        content_value === calls.upload[0].path,
    ),
  );
  assert.deepEqual(calls.remove, [[oldPath]]);
});

test("requires a useful image description before replacing the hero image", async () => {
  const calls = createClient();
  const file = new File(
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    "land.png",
    { type: "image/png" },
  );

  const result = await saveSiteContentSection(
    {},
    sectionForm(
      "home-hero",
      {},
      { "image.home.heroImagePath": file },
    ),
  );

  assert.equal(result.status, "error");
  assert.ok(result.fieldErrors["home.heroImageAlt"]);
  assert.equal(calls.upload.length, 0);
});

test("reports invalid image files and does not upload them", async () => {
  const calls = createClient();
  const file = new File(["not an image"], "land.txt", {
    type: "text/plain",
  });

  const form = sectionForm(
    "home-hero",
    { "home.heroImageAlt": "Open land in Kamakis" },
    { "image.home.heroImagePath": file },
  );
  assert.equal(form.get("image.home.heroImagePath").type, "text/plain");
  assert.equal(form.get("image.home.heroImagePath").size, file.size);
  assert.equal(getSiteContentSectionImages("home-hero").length, 1);
  assert.match(await validateImageFile(form.get("image.home.heroImagePath")), /JPEG/);
  const result = await saveSiteContentSection({}, form);

  assert.equal(result.status, "error");
  assert.ok(result.fieldErrors["home.heroImagePath"]);
  assert.equal(calls.upload.length, 0);
});

test("removes a newly uploaded image when the content write fails", async () => {
  const calls = createClient({ saveError: { code: "42501" } });
  const file = new File(
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    "land.png",
    { type: "image/png" },
  );

  const result = await saveSiteContentSection(
    {},
    sectionForm(
      "home-hero",
      { "home.heroImageAlt": "Open land in Kamakis" },
      { "image.home.heroImagePath": file },
    ),
  );

  assert.equal(result.status, "error");
  assert.equal(calls.upload.length, 1);
  assert.deepEqual(calls.remove, [[calls.upload[0].path]]);
});

test("restoring an image section deletes its override and unused image", async () => {
  const imagePath =
    "site-content/home/portfolio/12345678-1234-1234-1234-123456789abc.webp";
  const calls = createClient({
    imageRows: [
      { content_key: "home.portfolioImagePath", content_value: imagePath },
    ],
  });

  const result = await restoreSiteContent(
    {},
    createForm({ scope: "home-portfolio" }),
  );

  assert.equal(result.status, "success");
  assert.ok(
    calls.delete[0].includes("home.portfolioImagePath"),
  );
  assert.deepEqual(calls.remove, [[imagePath]]);
});

test("reports orphaned image cleanup failures after restoring defaults", async () => {
  const imagePath =
    "site-content/home/hero/12345678-1234-1234-1234-123456789abc.png";
  const calls = createClient({
    imageRows: [
      { content_key: "home.heroImagePath", content_value: imagePath },
    ],
    removeError: { code: "403" },
  });

  const result = await restoreSiteContent(
    {},
    createForm({ scope: "home-hero" }),
  );

  assert.equal(result.status, "success");
  assert.match(result.message, /could not be removed from Storage/);
  assert.deepEqual(calls.remove, [[imagePath]]);
});
