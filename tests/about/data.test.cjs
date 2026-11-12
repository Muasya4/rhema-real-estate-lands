/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
let currentClient;
let ioCalls = 0;

Module._load = function (request, parent, isMain) {
  if (request === "server-only") return {};
  if (request === "next/cache") {
    return {
      async io() {
        ioCalls += 1;
      },
    };
  }
  if (request === "../supabase/server") {
    return { createSupabaseServerClient: () => currentClient };
  }
  if (request === "../supabase/config") {
    return {
      SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

function createClient({ data, error = null, imageUrl = "https://images.test/portrait.png" }) {
  currentClient = {
    from(table) {
      assert.equal(table, "leadership_profile");
      return {
        select() {
          return this;
        },
        eq(column, value) {
          assert.equal(column, "profile_key");
          assert.equal(value, "ceo");
          return this;
        },
        async maybeSingle() {
          return { data, error };
        },
      };
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "property-images");
        return {
          getPublicUrl(path) {
            assert.equal(
              path,
              "leadership/11111111-1111-4111-8111-111111111111.jpg",
            );
            return { data: { publicUrl: imageUrl } };
          },
        };
      },
    },
  };
}

const { getPublicLeadershipProfile } = require("../../src/lib/leadership/data.ts");

test("loads the public CEO profile and portrait through the existing bucket", async () => {
  ioCalls = 0;
  createClient({
    data: {
      profile_key: "ceo",
      full_name: "Evans",
      title: "Chief Executive Officer",
      email: "evans@rhemarealestates.com",
      biography: null,
      image_path: "leadership/11111111-1111-4111-8111-111111111111.jpg",
    },
  });

  const result = await getPublicLeadershipProfile();

  assert.equal(ioCalls, 1);
  assert.equal(result.status, "success");
  assert.equal(result.profile.fullName, "Evans");
  assert.equal(result.imageSrc, "https://images.test/portrait.png");
});

test("surfaces read failures instead of returning an invented profile", async () => {
  createClient({ data: null, error: { code: "42P01" } });

  assert.deepEqual(await getPublicLeadershipProfile(), { status: "error" });
});
