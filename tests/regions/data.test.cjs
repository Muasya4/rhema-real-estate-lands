/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
let response;

Module._load = function (request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }
  if (request === "next/cache") {
    return { io: async () => {} };
  }
  if (request === "../supabase/server") {
    return {
      createSupabaseServerClient() {
        return {
          from(table) {
            assert.equal(table, "regions");
            return {
              select() {
                return this;
              },
              order() {
                return this;
              },
              then(resolve, reject) {
                return Promise.resolve(response).then(resolve, reject);
              },
            };
          },
        };
      },
    };
  }
  if (request === "../supabase/config") {
    return {
      SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const { getPublicRegions } = require("../../src/lib/regions/data.ts");

test("reads and parses ordered public regions", async () => {
  response = {
    data: [
      { slug: "ruiru", name: "Ruiru", display_order: 1 },
      { slug: "kamakis", name: "Kamakis", display_order: 2 },
    ],
    error: null,
  };

  const result = await getPublicRegions();
  assert.deepEqual(result, {
    status: "success",
    regions: [
      { slug: "ruiru", name: "Ruiru", displayOrder: 1 },
      { slug: "kamakis", name: "Kamakis", displayOrder: 2 },
    ],
  });
});

test("reports database failures without returning a static fallback", async () => {
  response = {
    data: null,
    error: { code: "42501" },
  };

  assert.deepEqual(await getPublicRegions(), { status: "error" });
});

test("reports invalid database records", async () => {
  response = {
    data: [{ slug: "Not a slug", name: "Invalid", display_order: 0 }],
    error: null,
  };

  assert.deepEqual(await getPublicRegions(), { status: "error" });
});
