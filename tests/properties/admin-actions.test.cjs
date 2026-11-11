/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
const propertyId = "11111111-1111-4111-8111-111111111111";
let currentClient;
let adminAllowed = true;

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
        if (!adminAllowed) {
          throw new Error("not-admin");
        }
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
  if (request === "next/cache") {
    return { revalidatePath() {} };
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
    title: "Quarter acre near Ruiru",
    slug: "quarter-acre-near-ruiru",
    description: "A plot near Ruiru.",
    location: "Ruiru",
    region: "ruiru",
    priceKes: "",
    plotSize: "",
    status: "",
    images: "[]",
    ...overrides,
  };

  for (const [name, value] of Object.entries(values)) {
    form.set(name, value);
  }

  return form;
}

function createClient({
  existing = null,
  insertError = null,
  updateError = null,
  uploadError = null,
  removeError = null,
} = {}) {
  const calls = { insert: [], update: [], upload: [], remove: [] };
  let operation = "select";
  currentClient = {
    from() {
      operation = "select";
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle() {
          if (operation === "select") {
            return Promise.resolve({ data: existing, error: null });
          }
          return Promise.resolve({
            data: updateError ? null : { id: propertyId },
            error: updateError,
          });
        },
        single() {
          return Promise.resolve({
            data: insertError ? null : { id: propertyId },
            error: insertError,
          });
        },
        update(values) {
          operation = "update";
          calls.update.push(values);
          return this;
        },
        insert(values) {
          operation = "insert";
          calls.insert.push(values);
          return this;
        },
      };
    },
    storage: {
      from() {
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

function validImageForm() {
  const form = formData({ imageAlt: "A view across the plot" });
  form.set(
    "imageFile",
    new File([Uint8Array.of(0xff, 0xd8, 0xff, 0x00)], "plot.jpg", {
      type: "image/jpeg",
    }),
  );
  return form;
}

const actions = require("../../src/lib/admin/properties/actions.ts");

test("rejects direct mutation attempts from non-admin users", async () => {
  createClient();
  adminAllowed = false;

  await assert.rejects(
    actions.saveProperty({}, formData()),
    (error) => error.message === "not-admin",
  );
  adminAllowed = true;
});

test("reports duplicate slugs as a field error", async () => {
  createClient({
    insertError: {
      code: "23505",
      message: 'duplicate key value violates unique constraint "properties_slug_key"',
    },
  });

  const result = await actions.saveProperty({}, formData());
  assert.equal(result.status, "error");
  assert.equal(result.fieldErrors.slug, "Choose a different slug.");
});

test("reports a field error when the selected region was removed", async () => {
  createClient({
    insertError: {
      code: "23503",
      message: "violates foreign key constraint properties_region_slug_fkey",
    },
  });

  const result = await actions.saveProperty({}, formData());
  assert.equal(result.status, "error");
  assert.match(result.fieldErrors.region, /active region/);
});

test("generates a property slug on the server when a new form omits it", async () => {
  const calls = createClient();
  const form = formData({ slug: "" });

  await assert.rejects(
    actions.saveProperty({}, form),
    (error) =>
      error instanceof RedirectSignal &&
      error.destination.startsWith("/admin/properties/") &&
      calls.insert[0].slug === "quarter-acre-near-ruiru",
  );
});

test("does not upload or save image content with a mismatched signature", async () => {
  const calls = createClient();
  const form = formData({ imageAlt: "A plot" });
  form.set(
    "imageFile",
    new File([Uint8Array.of(0, 1, 2)], "plot.jpg", { type: "image/jpeg" }),
  );

  const result = await actions.saveProperty({}, form);
  assert.equal(result.status, "error");
  assert.match(result.fieldErrors.imageFile, /does not match/);
  assert.equal(calls.upload.length, 0);
  assert.equal(calls.insert.length, 0);
});

test("cleans up a new image when the property write fails", async () => {
  const calls = createClient({
    insertError: { code: "42501", message: "not allowed" },
  });

  const result = await actions.saveProperty({}, validImageForm());
  assert.equal(result.status, "error");
  assert.equal(calls.upload.length, 1);
  assert.deepEqual(calls.remove, [[calls.upload[0].path]]);
  assert.equal(calls.insert.length, 1);
});

test("returns a field error when Storage rejects the image upload", async () => {
  const calls = createClient({
    uploadError: { code: "42501" },
  });

  const result = await actions.saveProperty({}, validImageForm());
  assert.equal(result.status, "error");
  assert.match(result.message, /image could not be uploaded/);
  assert.equal(calls.insert.length, 0);
  assert.equal(calls.remove.length, 0);
});

test("saves ordered images and redirects to the protected editor", async () => {
  const calls = createClient();

  await assert.rejects(
    actions.saveProperty({}, validImageForm()),
    (error) => {
      const savedId = error.destination?.match(
        /^\/admin\/properties\/([0-9a-f-]+)\?saved=1$/,
      )?.[1];
      return (
        error instanceof RedirectSignal &&
        Boolean(savedId) &&
        error.destination === `/admin/properties/${savedId}?saved=1` &&
        calls.insert[0].id === savedId
      );
    },
  );

  assert.equal(calls.insert.length, 1);
  assert.equal(calls.insert[0].images.length, 1);
  assert.equal(calls.insert[0].images[0].alt, "A view across the plot");
  assert.ok(calls.insert[0].images[0].path.startsWith(`${calls.insert[0].id}/`));
});

test("removes old images only after the updated property record is saved", async () => {
  const calls = createClient({
    existing: {
      slug: "quarter-acre-near-ruiru",
      images: [{ path: `${propertyId}/old.jpg`, alt: "Old view" }],
    },
  });
  const form = formData({
    id: propertyId,
    images: "[]",
  });

  await assert.rejects(
    actions.saveProperty({}, form),
    (error) =>
      error instanceof RedirectSignal &&
      error.destination === `/admin/properties/${propertyId}?saved=1`,
  );

  assert.equal(calls.update.length, 1);
  assert.deepEqual(calls.update[0].images, []);
  assert.deepEqual(calls.remove, [[`${propertyId}/old.jpg`]]);
});

test("shows a storage warning after saving when removed-object cleanup fails", async () => {
  createClient({
    existing: {
      slug: "quarter-acre-near-ruiru",
      images: [{ path: `${propertyId}/old.jpg`, alt: "Old view" }],
    },
    removeError: { code: "storage-error" },
  });
  const form = formData({
    id: propertyId,
    images: "[]",
  });

  await assert.rejects(
    actions.saveProperty({}, form),
    (error) =>
      error instanceof RedirectSignal &&
      error.destination ===
        `/admin/properties/${propertyId}?saved=1&storage-warning=1`,
  );
});
