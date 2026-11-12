/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { File } = require("node:buffer");
const { test } = require("node:test");

const originalLoad = Module._load;
let currentClient;
let adminAllowed = true;
let revalidatedPaths = [];

class RedirectSignal extends Error {
  constructor(destination) {
    super(destination);
    this.destination = destination;
  }
}

Module._load = function (request, parent, isMain) {
  if (request === "../../auth/guard") {
    return {
      async requireAdmin() {
        if (!adminAllowed) throw new Error("not-admin");
      },
    };
  }
  if (request === "../../supabase/auth-server") {
    return { createSupabaseAuthServerClient: async () => currentClient };
  }
  if (request === "../../supabase/config") {
    return {
      SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
    };
  }
  if (request === "../../storage/image-validation") {
    return {
      async validateImageFile() {
        return null;
      },
      getImageExtension() {
        return "png";
      },
    };
  }
  if (request === "next/cache") {
    return {
      revalidatePath(path) {
        revalidatedPaths.push(path);
      },
    };
  }
  if (request === "next/navigation") {
    return {
      redirect(destination) {
        throw new RedirectSignal(destination);
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

function formData(overrides = {}) {
  const form = new FormData();
  const values = {
    fullName: "Evans",
    title: "Chief Executive Officer",
    email: "evans@rhemarealestates.com",
    biography: "",
    removeImage: "",
    ...overrides,
  };
  for (const [name, value] of Object.entries(values)) {
    form.set(name, value);
  }
  return form;
}

function createClient({
  existingImagePath = null,
  updateError = null,
  uploadError = null,
  removeError = null,
} = {}) {
  const calls = { update: [], upload: [], remove: [] };
  let operation = "select";
  let imagePath = existingImagePath;
  let valuesToSave = null;
  currentClient = {
    from(table) {
      assert.equal(table, "leadership_profile");
      operation = "select";
      return {
        select() {
          return this;
        },
        eq(column, value) {
          assert.equal(column, "profile_key");
          assert.equal(value, "ceo");
          return this;
        },
        update(values) {
          operation = "update";
          valuesToSave = values;
          calls.update.push(values);
          return this;
        },
        async maybeSingle() {
          if (operation === "select") {
            return { data: { image_path: existingImagePath }, error: null };
          }
          if (updateError) return { data: null, error: updateError };
          imagePath = valuesToSave.image_path;
          return {
            data: {
              profile_key: "ceo",
              full_name: valuesToSave.full_name,
              title: valuesToSave.title,
              email: valuesToSave.email,
              biography: valuesToSave.biography,
              image_path: imagePath,
            },
            error: null,
          };
        },
      };
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "property-images");
        return {
          async upload(path, file, options) {
            calls.upload.push({ path, file, options });
            return { error: uploadError };
          },
          async remove(paths) {
            calls.remove.push(paths);
            return { error: removeError };
          },
        };
      },
    },
  };
  return calls;
}

const { saveLeadershipProfile } = require("../../src/lib/admin/about/actions.ts");

test("rejects profile writes from non-admin users", async () => {
  createClient();
  adminAllowed = false;
  await assert.rejects(
    saveLeadershipProfile({}, formData()),
    (error) => error.message === "not-admin",
  );
  adminAllowed = true;
});

test("saves editable CEO details and revalidates the public About page", async () => {
  const calls = createClient();
  revalidatedPaths = [];

  await assert.rejects(saveLeadershipProfile({}, formData()), (error) => {
    assert.ok(error instanceof RedirectSignal);
    assert.equal(error.destination, "/admin/about?saved=1");
    assert.equal(calls.update[0].full_name, "Evans");
    assert.equal(calls.update[0].email, "evans@rhemarealestates.com");
    assert.ok(revalidatedPaths.includes("/about"));
    assert.ok(revalidatedPaths.includes("/admin/about"));
    return true;
  });
});

test("uploads a new portrait before saving and removes the old file afterward", async () => {
  const oldPath = "leadership/11111111-1111-4111-8111-111111111111.jpg";
  const calls = createClient({ existingImagePath: oldPath });
  const form = formData();
  form.set("imageFile", new File(["portrait"], "portrait.png", { type: "image/png" }));

  await assert.rejects(saveLeadershipProfile({}, form), (error) => {
    assert.ok(error instanceof RedirectSignal);
    assert.equal(calls.upload.length, 1);
    assert.match(calls.upload[0].path, /^leadership\/[0-9a-f-]+\.png$/);
    assert.deepEqual(calls.remove, [[oldPath]]);
    assert.equal(calls.update[0].image_path, calls.upload[0].path);
    return true;
  });
});

test("removes the old portrait only after the profile update succeeds", async () => {
  const oldPath = "leadership/11111111-1111-4111-8111-111111111111.jpg";
  const calls = createClient({ existingImagePath: oldPath });
  const form = formData({ removeImage: "true" });

  await assert.rejects(saveLeadershipProfile({}, form), (error) => {
    assert.ok(error instanceof RedirectSignal);
    assert.equal(calls.update[0].image_path, null);
    assert.deepEqual(calls.remove, [[oldPath]]);
    return true;
  });
});
