/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  formatNairobiDateTimeLocal,
  parseNairobiDateTime,
  validateJournalForm,
} = require("../../src/lib/admin/journal/validation.ts");

function createForm(overrides = {}) {
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

test("validates a draft article with safe required text", () => {
  const result = validateJournalForm(createForm());

  assert.equal(result.success, true);
  assert.equal(result.values.publicationChoice, "draft");
  assert.equal(result.values.coverImage, null);
});

test("rejects invalid slugs, empty rich text, malformed cover paths, and bad state", () => {
  const result = validateJournalForm(
    createForm({
      slug: "Land--Kamakis",
      content: '<script>alert("x")</script><img src=x onerror=run()>',
      coverImage: "../private.jpg",
      publicationChoice: "unknown",
    }),
  );

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.slug);
  assert.ok(result.fieldErrors.content);
  assert.ok(result.fieldErrors.coverImage);
  assert.ok(result.fieldErrors.scheduledAt);
});

test("requires a future Nairobi time for scheduled articles", () => {
  const now = Date.parse("2026-03-10T09:00:00.000Z");
  assert.equal(
    parseNairobiDateTime("2026-03-10T13:00", now),
    "2026-03-10T10:00:00.000Z",
  );
  assert.equal(parseNairobiDateTime("2026-03-10T11:00", now), null);
  assert.equal(parseNairobiDateTime("2026-02-30T13:00", now), null);

  const invalid = validateJournalForm(
    createForm({
      publicationChoice: "scheduled",
      scheduledAtLocal: "2026-03-10T11:00",
    }),
  );
  assert.equal(invalid.success, false);
  assert.ok(invalid.fieldErrors.scheduledAt);
});

test("formats a scheduled timestamp as Nairobi local time", () => {
  assert.equal(
    formatNairobiDateTimeLocal("2026-03-10T10:00:00.000Z"),
    "2026-03-10T13:00",
  );
  assert.equal(formatNairobiDateTimeLocal(null), "");
});

test("keeps text within the Server Action size budget for a maximum-sized cover", () => {
  const result = validateJournalForm(
    createForm({ content: `<p>${"x".repeat(512 * 1024)}</p>` }),
  );
  assert.equal(result.success, false);
  assert.match(result.fieldErrors.content, /500 KiB/);
});
