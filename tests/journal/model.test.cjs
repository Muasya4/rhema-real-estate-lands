/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  formatJournalDate,
  formatJournalMetaDescription,
  parsePublicJournalPost,
  sanitizeJournalContent,
} = require("../../src/lib/journal/model.ts");

function createPost(overrides = {}) {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Buying land in Kamakis",
    slug: "buying-land-in-kamakis",
    excerpt: "Details about land in Kamakis.",
    content: "<p>Details about access and location.</p>",
    cover_image: "journal/kamakis.webp",
    published_at: "2026-11-08T12:00:00.000Z",
    ...overrides,
  };
}

test("parses a published journal post and its optional storage path", () => {
  const post = parsePublicJournalPost(
    createPost(),
    Date.parse("2026-11-09T12:00:00.000Z"),
  );

  assert.equal(post.slug, "buying-land-in-kamakis");
  assert.equal(post.coverImage, "journal/kamakis.webp");
  assert.equal(post.publishedAt, "2026-11-08T12:00:00.000Z");
});

test("accepts a missing cover image", () => {
  const post = parsePublicJournalPost(
    createPost({ cover_image: null }),
    Date.parse("2026-11-09T12:00:00.000Z"),
  );

  assert.equal(post.coverImage, null);
});

test("rejects scheduled posts and malformed cover paths", () => {
  const now = Date.parse("2026-11-08T12:00:00.000Z");

  assert.throws(
    () =>
      parsePublicJournalPost(
        createPost({ published_at: "2026-11-09T12:00:00.000Z" }),
        now,
      ),
    /future/,
  );
  assert.throws(
    () => parsePublicJournalPost(createPost({ cover_image: "../draft.jpg" }), now),
    /storage path/,
  );
  assert.throws(
    () =>
      parsePublicJournalPost(
        createPost({ cover_image: "https://example.invalid/image.jpg" }),
        now,
      ),
    /storage path/,
  );
});

test("sanitizes scripts, event handlers, and unsafe links from article content", () => {
  const html = sanitizeJournalContent(
    '<h2>Land in Kamakis</h2><p onclick="run()">Safe text</p><script>run()</script><a href="javascript:run()" onmouseover="run()">Unsafe link</a>',
  );

  assert.match(html, /<h2>Land in Kamakis<\/h2>/);
  assert.match(html, /<p>Safe text<\/p>/);
  assert.doesNotMatch(html, /<script|onclick|onmouseover|javascript:/i);
  assert.doesNotMatch(html, /run\(\)/);
});

test("formats stored publication dates and bounds metadata descriptions", () => {
  assert.equal(
    formatJournalDate("2026-11-08T12:00:00.000Z"),
    "8 November 2026",
  );
  assert.equal(
    formatJournalMetaDescription("  A   short excerpt. "),
    "A short excerpt.",
  );
  assert.equal(formatJournalMetaDescription("x".repeat(200)).length, 160);
});
