/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { slugify } = require("../../src/lib/slug.ts");

test("generates lowercase slugs with single hyphen separators", () => {
  assert.equal(slugify("Quarter-acre near Ruiru"), "quarter-acre-near-ruiru");
  assert.equal(slugify("  Thika Road / Kiambu  "), "thika-road-kiambu");
});

test("normalizes common accented Latin characters", () => {
  assert.equal(slugify("Café plot"), "cafe-plot");
});

test("returns an empty slug when a title has no supported characters", () => {
  assert.equal(slugify("土地"), "");
});
