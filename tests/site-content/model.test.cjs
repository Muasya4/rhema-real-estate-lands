/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_EDITABLE_KEYS,
  SITE_CONTENT_KEYS,
  SITE_CONTENT_SECTIONS,
  getDefaultSiteContent,
} = require("../../src/lib/site-content/defaults.ts");
const {
  applySiteContentOverrides,
  getSiteContentSectionKeys,
  getSiteContentSectionTextKeys,
  parseSiteContentOverrides,
  parseSiteContentSection,
} = require("../../src/lib/site-content/model.ts");

test("only approved page-section copy and home images are editable", () => {
  const sectionKeys = SITE_CONTENT_SECTIONS.flatMap((section) =>
    [
      ...section.fields.map(({ key }) => key),
      ...(section.images ?? []).map(({ key }) => key),
    ],
  );

  assert.equal(new Set(sectionKeys).size, sectionKeys.length);
  assert.deepEqual([...sectionKeys].sort(), [...SITE_CONTENT_EDITABLE_KEYS].sort());
  assert.ok(sectionKeys.every((key) => SITE_CONTENT_KEYS.includes(key)));
  assert.equal(SITE_CONTENT_SECTIONS.some(({ id }) => id === "shared"), false);
  assert.equal(sectionKeys.some((key) => key.startsWith("global.")), false);
  assert.equal(sectionKeys.some((key) => key.includes("Link")), false);
  assert.equal(sectionKeys.some((key) => key.startsWith("inquiry.")), false);
});

test("missing overrides retain the versioned defaults", () => {
  assert.deepEqual(applySiteContentOverrides({}), getDefaultSiteContent());
});

test("public defaults contain no draft image or planned journal notices", () => {
  const copy = Object.entries(SITE_CONTENT_DEFAULTS)
    .filter(([key]) => !key.endsWith("ImagePath"))
    .map(([, value]) => value)
    .join(" ")
    .toLowerCase();

  assert.doesNotMatch(copy, /placeholder|temporary|to be added|planned journal topic/);
  for (const key of [
    "home.plannedTopicOne",
    "home.heroImageLabel",
    "home.portfolioCaptionNote",
    "properties.cardImageLabel",
    "properties.detailImagePlaceholder",
  ]) {
    assert.ok(SITE_CONTENT_KEYS.includes(key));
    assert.equal(SITE_CONTENT_EDITABLE_KEYS.includes(key), false);
  }
});

test("valid overrides replace defaults without changing other copy", () => {
  const content = applySiteContentOverrides({
    "home.title": "Plots in Kiambu.",
  });

  assert.equal(content["home.title"], "Plots in Kiambu.");
  assert.equal(content["home.titleHighlight"], SITE_CONTENT_DEFAULTS["home.titleHighlight"]);
});

test("legacy overrides for protected controls are ignored", () => {
  const content = applySiteContentOverrides({
    "global.nav.journal": "Profile",
    "home.titleStart": "New opening",
    "site.metaTitle": "Different search title",
    "home.heroImageLabel": "Temporary land image",
  });

  assert.equal(content["global.nav.journal"], SITE_CONTENT_DEFAULTS["global.nav.journal"]);
  assert.equal(content["home.titleStart"], SITE_CONTENT_DEFAULTS["home.titleStart"]);
  assert.equal(content["site.metaTitle"], SITE_CONTENT_DEFAULTS["site.metaTitle"]);
  assert.equal(
    content["home.heroImageLabel"],
    SITE_CONTENT_DEFAULTS["home.heroImageLabel"],
  );
});

test("override parser rejects malformed, unsupported, duplicate, blank, and oversized rows", () => {
  const invalidRows = [
    [null],
    [{ content_key: 4, content_value: "Text" }],
    [{ content_key: "unsupported.key", content_value: "Text" }],
    [{ content_key: "home.intro", content_value: "  " }],
    [{ content_key: "home.intro", content_value: "x".repeat(2001) }],
    [{ content_key: "home.heroImagePath", content_value: "https://example.test/image.jpg" }],
    [
      { content_key: "home.intro", content_value: "One" },
      { content_key: "home.intro", content_value: "Two" },
    ],
  ];

  for (const rows of invalidRows) {
    assert.throws(() => parseSiteContentOverrides(rows), TypeError);
  }
});

test("section keys are allowlisted and text values are trimmed", () => {
  const keys = getSiteContentSectionTextKeys("home-hero");
  assert.ok(keys);
  assert.ok(keys.includes("home.title"));
  assert.equal(getSiteContentSectionKeys("unknown"), null);
  const values = Object.fromEntries(
    keys.map((key) => [key, SITE_CONTENT_DEFAULTS[key]]),
  );
  values["home.title"] = "  Plots across Nairobi  ";

  assert.deepEqual(
    parseSiteContentSection("home-hero", values),
    { ...values, "home.title": "Plots across Nairobi" },
  );
  assert.throws(
    () => parseSiteContentSection("home-hero", { "home.title": " " }),
    TypeError,
  );
});

test("image overrides accept only generated Storage paths", () => {
  const rows = [
    {
      content_key: "home.heroImagePath",
      content_value:
        "site-content/home/hero/12345678-1234-1234-1234-123456789abc.jpg",
    },
  ];

  assert.deepEqual(parseSiteContentOverrides(rows), {
    "home.heroImagePath": rows[0].content_value,
  });
  assert.equal(
    getSiteContentSectionKeys("home-hero").includes("home.heroImagePath"),
    true,
  );
});
