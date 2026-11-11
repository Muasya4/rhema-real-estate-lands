/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  SiteUrlConfigurationError,
  buildPageMetadata,
  getSiteUrl,
} = require("../../src/lib/seo/site-url.ts");

test("validates and normalizes the configured canonical origin", () => {
  const originalSiteUrl = process.env.SITE_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    process.env.NODE_ENV = "test";
    process.env.SITE_URL = "https://rhema.example/";
    assert.equal(getSiteUrl().toString(), "https://rhema.example/");

    process.env.SITE_URL = "https://rhema.example/path";
    assert.throws(() => getSiteUrl(), SiteUrlConfigurationError);

    process.env.SITE_URL = "http://rhema.example";
    assert.throws(() => getSiteUrl(), SiteUrlConfigurationError);

    process.env.SITE_URL = "http://localhost:3000";
    assert.equal(getSiteUrl().toString(), "http://localhost:3000/");

    delete process.env.SITE_URL;
    process.env.NODE_ENV = "production";
    assert.throws(() => getSiteUrl(), /Missing SITE_URL/);
  } finally {
    if (originalSiteUrl === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = originalSiteUrl;
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test("builds canonical and social metadata only with a configured origin", () => {
  const originalSiteUrl = process.env.SITE_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    process.env.NODE_ENV = "test";
    process.env.SITE_URL = "https://rhema.example";

    const metadata = buildPageMetadata({
      title: "A Kamakis plot",
      description: "A published plot in Kamakis.",
      path: "/properties/kamakis-plot",
      image: "https://images.example.invalid/kamakis.webp",
    });

    assert.equal(
      metadata.alternates.canonical,
      "https://rhema.example/properties/kamakis-plot",
    );
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.deepEqual(metadata.openGraph.images, [
      "https://images.example.invalid/kamakis.webp",
    ]);
    assert.equal(metadata.twitter.card, "summary_large_image");

    const unavailableMetadata = buildPageMetadata({
      title: "Property not found",
      description: "This property page is not available.",
      path: "/properties/unpublished",
      noindex: true,
    });

    assert.equal(unavailableMetadata.alternates, undefined);
    assert.deepEqual(unavailableMetadata.robots, {
      index: false,
      follow: false,
    });

    delete process.env.SITE_URL;
    const localMetadata = buildPageMetadata({
      title: "Journal",
      description: "Published notes from Rhema.",
      path: "/journal",
    });
    assert.equal(localMetadata.alternates, undefined);
    assert.equal(localMetadata.openGraph.url, undefined);
  } finally {
    if (originalSiteUrl === undefined) {
      delete process.env.SITE_URL;
    } else {
      process.env.SITE_URL = originalSiteUrl;
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});
