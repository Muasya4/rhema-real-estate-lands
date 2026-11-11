/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  validateInquiryForm,
} = require("../../src/lib/inquiries/validation.ts");

function createForm(overrides = {}) {
  const formData = new FormData();
  const values = {
    name: "Test Visitor",
    email: "visitor@example.invalid",
    phone: "+254 711 634 163",
    message: "I would like to ask about land in Ruiru.",
    propertyId: "",
    ...overrides,
  };

  for (const [name, value] of Object.entries(values)) {
    formData.set(name, value);
  }

  return formData;
}

test("valid fields are trimmed and retained", () => {
  const result = validateInquiryForm(
    createForm({
      name: " Test Visitor ",
      email: " visitor@example.invalid ",
      phone: " +254 711 634 163 ",
    }),
  );

  assert.equal(result.success, true);
  assert.equal(result.values.name, "Test Visitor");
  assert.equal(result.values.email, "visitor@example.invalid");
});

test("invalid email and phone are rejected", () => {
  const result = validateInquiryForm(
    createForm({ email: "not-an-email", phone: "call me" }),
  );

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.email);
  assert.ok(result.fieldErrors.phone);
});

test("oversized fields and malformed property IDs are rejected", () => {
  const result = validateInquiryForm(
    createForm({
      name: "N".repeat(121),
      propertyId: "not-a-uuid",
    }),
  );

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.name);
  assert.ok(result.fieldErrors.propertyId);
});
