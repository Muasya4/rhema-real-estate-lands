/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "next/server") {
    return { connection: async () => {} };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const journalData = require("../../src/lib/journal/data.ts");
const propertiesData = require("../../src/lib/properties/data.ts");
const sitemap = require("../../src/app/sitemap.ts").default;
const robots = require("../../src/app/robots.ts").default;
Module._load = originalLoad;

test("sitemap includes static pages and every published detail route only", async () => {
  const originalSiteUrl = process.env.SITE_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPropertyReader = propertiesData.getPublishedProperties;
  const originalJournalReader = journalData.getPublishedJournalPosts;
  const journalPages = [];

  try {
    process.env.NODE_ENV = "test";
    process.env.SITE_URL = "https://rhema.example";
    propertiesData.getPublishedProperties = async () => ({
      status: "success",
      properties: [{ slug: "kamakis-plot" }],
    });
    journalData.getPublishedJournalPosts = async (page) => {
      journalPages.push(page);
      return {
        status: "success",
        posts: [{ slug: `published-${page}` }],
        page,
        pageCount: 2,
        total: 2,
      };
    };

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    assert.deepEqual(journalPages, [1, 2]);
    assert.deepEqual(urls, [
      "https://rhema.example/",
      "https://rhema.example/properties",
      "https://rhema.example/regions",
      "https://rhema.example/journal",
      "https://rhema.example/contact",
      "https://rhema.example/properties/kamakis-plot",
      "https://rhema.example/journal/published-1",
      "https://rhema.example/journal/published-2",
    ]);
    assert.equal(urls.some((url) => url.includes("/admin")), false);
    assert.equal(urls.some((url) => url.includes("?page=")), false);
  } finally {
    propertiesData.getPublishedProperties = originalPropertyReader;
    journalData.getPublishedJournalPosts = originalJournalReader;

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

test("sitemap fails explicitly when a public data reader fails", async () => {
  const originalSiteUrl = process.env.SITE_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPropertyReader = propertiesData.getPublishedProperties;

  try {
    process.env.NODE_ENV = "test";
    process.env.SITE_URL = "https://rhema.example";
    propertiesData.getPublishedProperties = async () => ({ status: "error" });

    await assert.rejects(sitemap(), /could not load published properties/);
  } finally {
    propertiesData.getPublishedProperties = originalPropertyReader;

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

test("robots allows crawlers to read noindex directives and links to the sitemap", () => {
  const originalSiteUrl = process.env.SITE_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    process.env.NODE_ENV = "test";
    process.env.SITE_URL = "https://rhema.example";

    assert.deepEqual(robots(), {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://rhema.example/sitemap.xml",
    });
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
