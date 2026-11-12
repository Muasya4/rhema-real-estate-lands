/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  parseLeadershipImagePath,
  parseLeadershipProfile,
} = require("../../src/lib/leadership/model.ts");

const validProfile = {
  profile_key: "ceo",
  full_name: "Evans",
  title: "Chief Executive Officer",
  email: "evans@rhemarealestates.com",
  biography: null,
  image_path: null,
};

test("parses the confirmed CEO profile and an optional leadership image", () => {
  assert.deepEqual(parseLeadershipProfile(validProfile), {
    fullName: "Evans",
    title: "Chief Executive Officer",
    email: "evans@rhemarealestates.com",
    biography: null,
    imagePath: null,
  });
  assert.equal(
    parseLeadershipImagePath(
      "leadership/11111111-1111-4111-8111-111111111111.webp",
    ),
    "leadership/11111111-1111-4111-8111-111111111111.webp",
  );
});

test("rejects malformed, unexpected, and out-of-scope leadership records", () => {
  assert.throws(
    () => parseLeadershipProfile({ ...validProfile, email: "not-an-email" }),
    TypeError,
  );
  assert.throws(
    () => parseLeadershipProfile({ ...validProfile, profile_key: "other" }),
    TypeError,
  );
  assert.throws(() => parseLeadershipImagePath("../private.png"), TypeError);
  assert.throws(
    () =>
      parseLeadershipImagePath(
        "leadership/11111111-1111-4111-8111-111111111111.jpg/../private.png",
      ),
    TypeError,
  );
});
