/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { validateLeadershipForm } = require("../../src/lib/admin/about/validation.ts");

function createForm(overrides = {}) {
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

test("validates the confirmed CEO details and an optional biography", () => {
  const result = validateLeadershipForm(
    createForm({ biography: "Rhema Real Estates sells land in Kenya." }),
  );

  assert.equal(result.success, true);
  assert.equal(result.values.fullName, "Evans");
  assert.equal(result.values.biography, "Rhema Real Estates sells land in Kenya.");
  assert.equal(result.values.imageFile, null);
});

test("rejects missing or invalid profile fields and oversized biography text", () => {
  const result = validateLeadershipForm(
    createForm({
      fullName: " ",
      title: "",
      email: "bad",
      biography: "x".repeat(2001),
    }),
  );

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.fullName);
  assert.ok(result.fieldErrors.title);
  assert.ok(result.fieldErrors.email);
  assert.ok(result.fieldErrors.biography);
});

test("rejects malformed removal state and multiple portrait files", () => {
  const form = createForm({ removeImage: "yes" });
  const file = new File(["portrait"], "portrait.png", { type: "image/png" });
  form.append("imageFile", file);
  form.append("imageFile", file);

  const result = validateLeadershipForm(form);

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.imageFile);
});
