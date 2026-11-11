/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
let records;

Module._load = function (request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }
  if (request === "../../supabase/auth-server") {
    return {
      createSupabaseAuthServerClient: async () => ({
        from(table) {
          assert.equal(table, "properties");
          return {
            select(selection) {
              assert.match(selection, /regionInfo:regions!properties_region_slug_fkey/);
              return this;
            },
            order() {
              return this;
            },
            then(resolve, reject) {
              return Promise.resolve({ data: records, error: null }).then(
                resolve,
                reject,
              );
            },
          };
        },
      }),
    };
  }
  if (request === "../../supabase/config") {
    return {
      SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

const { getAdminProperties } = require("../../src/lib/admin/properties/data.ts");

test("loads admin properties with current managed region names", async () => {
  records = [
    {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Quarter-acre plot",
      slug: "quarter-acre-plot",
      description: "A plot in Ruiru.",
      location: "Ruiru",
      region: "ruiru",
      regionInfo: { name: "Ruiru North" },
      price_kes: null,
      plot_size: null,
      status: null,
      featured: false,
      is_published: false,
      created_at: "2026-11-08T12:00:00.000Z",
      images: [],
    },
  ];

  const result = await getAdminProperties();
  assert.equal(result.status, "success");
  assert.equal(result.properties[0].region, "ruiru");
  assert.equal(result.properties[0].regionName, "Ruiru North");
});
