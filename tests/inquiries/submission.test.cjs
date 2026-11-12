/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { processInquirySubmission } = require("../../src/lib/inquiries/submission.ts");
const { getDefaultSiteContent } = require("../../src/lib/site-content/defaults.ts");

const publishedPropertyId = "11111111-1111-4111-8111-111111111111";

function createForm(overrides = {}) {
  const formData = new FormData();
  const values = {
    name: "Test Visitor",
    email: "visitor@example.invalid",
    phone: "+254 711 634 163",
    message: "I would like to ask about land in Ruiru.",
    propertyId: "",
    website: "",
    turnstileToken: "test-token",
    ...overrides,
  };

  for (const [name, value] of Object.entries(values)) {
    formData.set(name, value);
  }

  return formData;
}

function createDependencies(overrides = {}) {
  const calls = { verify: 0, checkProperty: 0, insert: 0, values: null };
  const dependencies = {
    async verifyTurnstile(token) {
      calls.verify += 1;
      return token === "test-token";
    },
    async checkProperty(propertyId) {
      calls.checkProperty += 1;
      return propertyId === publishedPropertyId ? "published" : "not-published";
    },
    async insertInquiry(values) {
      calls.insert += 1;
      calls.values = values;
      return true;
    },
    ...overrides,
  };

  return { calls, dependencies };
}

test("valid general inquiry is inserted with a null property ID", async () => {
  const { calls, dependencies } = createDependencies();
  const result = await processInquirySubmission(createForm(), dependencies);

  assert.equal(result.status, "success");
  assert.equal(calls.verify, 1);
  assert.equal(calls.checkProperty, 0);
  assert.equal(calls.insert, 1);
  assert.equal(calls.values.propertyId, null);
});

test("published property inquiry keeps the supplied property ID", async () => {
  const { calls, dependencies } = createDependencies();
  const result = await processInquirySubmission(
    createForm({ propertyId: publishedPropertyId }),
    dependencies,
  );

  assert.equal(result.status, "success");
  assert.equal(calls.checkProperty, 1);
  assert.equal(calls.values.propertyId, publishedPropertyId);
});

test("unpublished property inquiry is rejected before insertion", async () => {
  const { calls, dependencies } = createDependencies();
  const result = await processInquirySubmission(
    createForm({ propertyId: "22222222-2222-4222-8222-222222222222" }),
    dependencies,
  );

  assert.equal(result.status, "error");
  assert.equal(calls.insert, 0);
});

test("failed Turnstile verification is rejected before insertion", async () => {
  const { calls, dependencies } = createDependencies({
    async verifyTurnstile() {
      calls.verify += 1;
      return false;
    },
  });
  const result = await processInquirySubmission(createForm(), dependencies);

  assert.equal(result.status, "error");
  assert.equal(calls.insert, 0);
});

test("replayed Turnstile token can only insert once", async () => {
  const usedTokens = new Set();
  const { calls, dependencies } = createDependencies({
    async verifyTurnstile(token) {
      calls.verify += 1;
      if (usedTokens.has(token)) {
        return false;
      }

      usedTokens.add(token);
      return true;
    },
  });
  const formData = createForm();

  const first = await processInquirySubmission(formData, dependencies);
  const replay = await processInquirySubmission(formData, dependencies);

  assert.equal(first.status, "success");
  assert.equal(replay.status, "error");
  assert.equal(calls.insert, 1);
});

test("honeypot submission is rejected before verification", async () => {
  const { calls, dependencies } = createDependencies();
  const result = await processInquirySubmission(
    createForm({ website: "https://spam.example.invalid" }),
    dependencies,
  );

  assert.equal(result.status, "error");
  assert.equal(calls.verify, 0);
  assert.equal(calls.insert, 0);
});

test("database failure is returned as an error, not success", async () => {
  const { calls, dependencies } = createDependencies({
    async insertInquiry() {
      calls.insert += 1;
      return false;
    },
  });
  const result = await processInquirySubmission(createForm(), dependencies);

  assert.equal(result.status, "error");
  assert.match(result.message, /was not sent/);
});

test("inquiry validation and feedback use the current editable site copy", async () => {
  const { dependencies } = createDependencies();
  const content = {
    ...getDefaultSiteContent(),
    "inquiry.nameRequired": "Enter a full name.",
    "inquiry.reviewFields": "Check the form fields.",
  };
  const result = await processInquirySubmission(
    createForm({ name: "" }),
    dependencies,
    content,
  );

  assert.equal(result.status, "error");
  assert.equal(result.fieldErrors.name, "Enter a full name.");
  assert.equal(result.message, "Check the form fields.");
});
