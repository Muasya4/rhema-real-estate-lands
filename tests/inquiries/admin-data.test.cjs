/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const inquiryId = "11111111-1111-4111-8111-111111111111";
const propertyId = "22222222-2222-4222-8222-222222222222";
const originalLoad = Module._load;
let activeClient;
let configurationError;
let configurationFailure = false;

Module._load = function (request, parent, isMain) {
  if (request === "../../supabase/auth-server") {
    return {
      createSupabaseAuthServerClient: async () => {
        if (configurationFailure) {
          throw new configurationError("missing configuration");
        }
        return activeClient;
      },
    };
  }
  if (request === "../../supabase/config") {
    return { SupabaseConfigurationError: configurationError };
  }
  if (request === "server-only") {
    return {};
  }
  return originalLoad.call(this, request, parent, isMain);
};

configurationError = class SupabaseConfigurationError extends Error {};
const { getAdminInquiries } = require("../../src/lib/admin/inquiries/data.ts");

function createInquiry(overrides = {}) {
  return {
    id: inquiryId,
    name: "Test Visitor",
    email: "visitor@example.invalid",
    phone: "+254 711 634 163",
    message: "I would like to ask about land in Ruiru.",
    property_id: propertyId,
    property: { id: propertyId, title: "Quarter-acre plot" },
    created_at: "2026-11-08T12:00:00.000Z",
    ...overrides,
  };
}

function mockClient(response) {
  const query = {
    selection: "",
    orders: [],
    select(selection) {
      this.selection = selection;
      return this;
    },
    order(field, options) {
      this.orders.push([field, options]);
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(response).then(resolve, reject);
    },
  };

  activeClient = {
    from(table) {
      assert.equal(table, "inquiries");
      return query;
    },
  };

  return query;
}

test("loads admin inquiries newest first with associated property details", async () => {
  const query = mockClient({
    data: [createInquiry()],
    error: null,
  });

  const result = await getAdminInquiries();

  assert.equal(result.status, "success");
  assert.deepEqual(result.inquiries[0], {
    id: inquiryId,
    name: "Test Visitor",
    email: "visitor@example.invalid",
    phone: "+254 711 634 163",
    message: "I would like to ask about land in Ruiru.",
    propertyId,
    property: { id: propertyId, title: "Quarter-acre plot" },
    createdAt: "2026-11-08T12:00:00.000Z",
  });
  assert.match(query.selection, /property:properties!inquiries_property_id_fkey/);
  assert.deepEqual(query.orders, [
    ["created_at", { ascending: false }],
    ["id", { ascending: false }],
  ]);
});

test("loads a general inquiry with no property association", async () => {
  mockClient({
    data: [createInquiry({ property_id: null, property: null })],
    error: null,
  });

  const result = await getAdminInquiries();

  assert.equal(result.status, "success");
  assert.equal(result.inquiries[0].propertyId, null);
  assert.equal(result.inquiries[0].property, null);
});

test("returns an error when the inquiry query fails", async () => {
  mockClient({
    data: null,
    error: { code: "42501" },
  });

  assert.deepEqual(await getAdminInquiries(), { status: "error" });
});

test("rejects malformed inquiry records without exposing their content", async () => {
  mockClient({
    data: [createInquiry({ message: null })],
    error: null,
  });

  assert.deepEqual(await getAdminInquiries(), { status: "error" });
});

test("returns an error when Supabase configuration is unavailable", async () => {
  configurationFailure = true;
  try {
    assert.deepEqual(await getAdminInquiries(), { status: "error" });
  } finally {
    configurationFailure = false;
  }
});
