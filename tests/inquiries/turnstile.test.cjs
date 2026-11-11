/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  verifyTurnstileToken,
} = require("../../src/lib/inquiries/turnstile.ts");

test("Turnstile accepts a successful response for the inquiry action", async () => {
  let requestUrl = "";
  let requestOptions;
  const result = await verifyTurnstileToken(
    "opaque-token",
    "server-secret",
    async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return Response.json({ success: true, action: "rhema_inquiry" });
    },
  );

  assert.equal(result, true);
  assert.match(requestUrl, /turnstile\/v0\/siteverify$/);
  assert.equal(JSON.parse(requestOptions.body).response, "opaque-token");
  assert.equal(JSON.parse(requestOptions.body).secret, "server-secret");
});

test("Turnstile rejects failed and mismatched action responses", async () => {
  const failed = await verifyTurnstileToken(
    "opaque-token",
    "server-secret",
    async () => Response.json({ success: false, action: "rhema_inquiry" }),
  );
  const wrongAction = await verifyTurnstileToken(
    "opaque-token",
    "server-secret",
    async () => Response.json({ success: true, action: "other_action" }),
  );

  assert.equal(failed, false);
  assert.equal(wrongAction, false);
});

test("Turnstile fails closed when verification cannot be reached", async () => {
  const result = await verifyTurnstileToken(
    "opaque-token",
    "server-secret",
    async () => {
      throw new Error("network unavailable");
    },
  );

  assert.equal(result, false);
});
