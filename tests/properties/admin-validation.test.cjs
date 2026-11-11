/* eslint-disable @typescript-eslint/no-require-imports */

const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  maximumPropertyImageBytes,
  validatePropertyForm,
  validatePropertyImageFile,
} = require("../../src/lib/admin/properties/validation.ts");

function createForm(overrides = {}) {
  const formData = new FormData();
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
    formData.set(name, value);
  }

  return formData;
}

test("validates property fields and keeps optional facts nullable", () => {
  const result = validatePropertyForm(createForm());

  assert.equal(result.success, true);
  assert.equal(result.values.priceKes, null);
  assert.equal(result.values.plotSize, null);
  assert.equal(result.values.status, null);
  assert.equal(result.values.isPublished, false);
  assert.equal(result.values.featured, false);
});

test("rejects malformed slugs, invalid regions, and unsafe prices", () => {
  const result = validatePropertyForm(
    createForm({
      slug: "Ruiru--plot",
      region: "not_a_region",
      priceKes: "9007199254740992",
    }),
  );

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.slug);
  assert.ok(result.fieldErrors.region);
  assert.ok(result.fieldErrors.priceKes);
});

test("accepts a valid slug for an admin-managed region", () => {
  const result = validatePropertyForm(createForm({ region: "nakuru" }));

  assert.equal(result.success, true);
  assert.equal(result.values.region, "nakuru");
});

test("rejects a client-supplied image path that does not match the database image shape", () => {
  const result = validatePropertyForm(
    createForm({
      images: JSON.stringify([{ path: "https://example.invalid/a.jpg", alt: "Plot" }]),
    }),
  );

  assert.equal(result.success, false);
  assert.ok(result.fieldErrors.images);
});

test("enforces the 5 MiB image limit", async () => {
  const file = new File(
    [new Uint8Array(maximumPropertyImageBytes + 1)],
    "plot.jpg",
    { type: "image/jpeg" },
  );

  assert.match(await validatePropertyImageFile(file), /5 MiB/);
});

test("checks image signatures rather than trusting the supplied MIME type", async () => {
  const mislabeled = new File([Uint8Array.of(0, 1, 2, 3)], "plot.jpg", {
    type: "image/jpeg",
  });
  const jpeg = new File(
    [Uint8Array.of(0xff, 0xd8, 0xff, 0x00)],
    "plot.jpg",
    { type: "image/jpeg" },
  );

  assert.match(
    await validatePropertyImageFile(mislabeled),
    /does not match its image type/,
  );
  assert.equal(await validatePropertyImageFile(jpeg), null);
});
