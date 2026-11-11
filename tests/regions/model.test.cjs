/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { isRegionSlug, parseRegion } = require("../../src/lib/regions/model.ts");

test("parses a managed region", () => {
  assert.deepEqual(
    parseRegion({
      slug: "thika-road-corridor",
      name: "Thika Road corridor",
      display_order: 3,
    }),
    {
      slug: "thika-road-corridor",
      name: "Thika Road corridor",
      displayOrder: 3,
    },
  );
});

test("rejects malformed or incomplete region records", () => {
  assert.throws(
    () =>
      parseRegion({
        slug: "Invalid region",
        name: "Invalid",
        display_order: 0,
      }),
    /invalid values/,
  );
  assert.throws(
    () =>
      parseRegion({
        slug: "ruiru",
        name: "Ruiru",
        display_order: -1,
      }),
    /invalid values/,
  );
});

test("validates region slugs using the property slug format", () => {
  assert.equal(isRegionSlug("nairobi-metropolitan-area"), true);
  assert.equal(isRegionSlug("Ruiru"), false);
  assert.equal(isRegionSlug("ruiru--north"), false);
});
