/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
let currentClient;
let adminAllowed = true;
let revalidatedPaths = [];

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
    return {
      revalidatePath(path) {
        revalidatedPaths.push(path);
      },
    };
  }

  return originalLoad.call(this, request, parent, isMain);
};

function createForm(values) {
  const form = new FormData();
  for (const [name, value] of Object.entries(values)) {
    form.set(name, value);
  }
  return form;
}

function createClient({
  currentOrder = 10,
  insertError = null,
  updateError = null,
  deleteError = null,
} = {}) {
  const calls = { insert: [], update: [], delete: [] };

  class QueryBuilder {
    constructor() {
      this.operation = "read";
    }

    select() {
      return this;
    }

    order() {
      return this;
    }

    limit() {
      return this;
    }

    maybeSingle() {
      if (this.operation === "read") {
        return Promise.resolve({
          data: { display_order: currentOrder },
          error: null,
        });
      }

      if (this.operation === "update") {
        return Promise.resolve({
          data: updateError ? null : { slug: "nakuru-county" },
          error: updateError,
        });
      }

      return Promise.resolve({
        data: deleteError ? null : { slug: "nakuru-county" },
        error: deleteError,
      });
    }

    insert(values) {
      this.operation = "insert";
      calls.insert.push(values);
      return this;
    }

    update(values) {
      this.operation = "update";
      calls.update.push(values);
      return this;
    }

    delete() {
      this.operation = "delete";
      calls.delete.push(true);
      return this;
    }

    eq() {
      return this;
    }

    then(resolve, reject) {
      return Promise.resolve({ error: insertError }).then(resolve, reject);
    }
  }

  currentClient = { from: () => new QueryBuilder() };
  return calls;
}

const actions = require("../../src/lib/admin/regions/actions.ts");

test("rejects region mutations from non-admin users", async () => {
  createClient();
  adminAllowed = false;

  await assert.rejects(
    actions.createRegion({}, createForm({ name: "Nakuru County" })),
    (error) => error.message === "not-admin",
  );
  adminAllowed = true;
});

test("creates a region with a generated slug and appended display order", async () => {
  const calls = createClient({ currentOrder: 10 });
  revalidatedPaths = [];

  const result = await actions.createRegion(
    {},
    createForm({ name: "Nakuru County" }),
  );

  assert.equal(result.status, "success");
  assert.deepEqual(calls.insert, [
    { slug: "nakuru-county", name: "Nakuru County", display_order: 11 },
  ]);
  assert.ok(revalidatedPaths.includes("/regions"));
  assert.ok(revalidatedPaths.includes("/"));
});

test("rejects region names that cannot produce a slug", async () => {
  const calls = createClient();

  const result = await actions.createRegion(
    {},
    createForm({ name: "!!!" }),
  );

  assert.equal(result.status, "error");
  assert.equal(calls.insert.length, 0);
});

test("reports duplicate region names", async () => {
  createClient({
    insertError: {
      code: "23505",
      message: "duplicate key value violates unique constraint",
    },
  });

  const result = await actions.createRegion(
    {},
    createForm({ name: "Nakuru County" }),
  );

  assert.equal(result.status, "error");
  assert.match(result.message, /already exists/);
});

test("renames a region without changing its stable slug", async () => {
  const calls = createClient();
  const result = await actions.renameRegion(
    {},
    createForm({ slug: "nakuru-county", name: "Nakuru" }),
  );

  assert.equal(result.status, "success");
  assert.deepEqual(calls.update, [{ name: "Nakuru" }]);
});

test("blocks deletion of a region that properties still use", async () => {
  const calls = createClient({
    deleteError: {
      code: "23503",
      message: "violates foreign key constraint properties_region_slug_fkey",
    },
  });

  const result = await actions.deleteRegion(
    {},
    createForm({ slug: "ruiru" }),
  );

  assert.equal(result.status, "error");
  assert.match(result.message, /Reassign properties/);
  assert.equal(calls.delete.length, 1);
});

test("deletes an unused region", async () => {
  createClient();

  const result = await actions.deleteRegion(
    {},
    createForm({ slug: "nakuru-county" }),
  );

  assert.equal(result.status, "success");
});
