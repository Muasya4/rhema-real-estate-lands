/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_KEYS,
  SITE_CONTENT_SECTIONS,
  getDefaultSiteContent,
} = require("../../src/lib/site-content/defaults.ts");
const {
  applySiteContentOverrides,
  getSiteContentSectionKeys,
  parseSiteContentOverrides,
  parseSiteContentSection,
} = require("../../src/lib/site-content/model.ts");

test("every default content key belongs to exactly one editor section", () => {
  const sectionKeys = SITE_CONTENT_SECTIONS.flatMap((section) =>
    section.fields.map(({ key }) => key),
  );

  assert.equal(new Set(sectionKeys).size, sectionKeys.length);
  assert.deepEqual([...sectionKeys].sort(), [...SITE_CONTENT_KEYS].sort());
});

test("missing overrides retain the versioned defaults", () => {
  assert.deepEqual(applySiteContentOverrides({}), getDefaultSiteContent());
});

test("valid overrides replace defaults without changing other copy", () => {
  const content = applySiteContentOverrides({
    "home.titleStart": "Plots in",
  });

  assert.equal(content["home.titleStart"], "Plots in");
  assert.equal(content["home.titleHighlight"], SITE_CONTENT_DEFAULTS["home.titleHighlight"]);
});

test("override parser rejects malformed, unsupported, duplicate, blank, and oversized rows", () => {
  const invalidRows = [
    [null],
    [{ content_key: 4, content_value: "Text" }],
    [{ content_key: "unsupported.key", content_value: "Text" }],
    [{ content_key: "home.intro", content_value: "  " }],
    [{ content_key: "home.intro", content_value: "x".repeat(2001) }],
    [
      { content_key: "home.intro", content_value: "One" },
      { content_key: "home.intro", content_value: "Two" },
    ],
  ];

  for (const rows of invalidRows) {
    assert.throws(() => parseSiteContentOverrides(rows), TypeError);
  }
});

test("section keys are allowlisted and section values are trimmed", () => {
  const keys = getSiteContentSectionKeys("home");
  assert.ok(keys);
  assert.ok(keys.includes("home.titleStart"));
  assert.equal(getSiteContentSectionKeys("unknown"), null);
  const values = Object.fromEntries(
    keys.map((key) => [key, SITE_CONTENT_DEFAULTS[key]]),
  );
  values["home.titleStart"] = "  Plots across  ";

  assert.deepEqual(
    parseSiteContentSection("home", values),
    { ...values, "home.titleStart": "Plots across" },
  );
  assert.throws(
    () => parseSiteContentSection("home", { "home.titleStart": " " }),
    TypeError,
  );
});
