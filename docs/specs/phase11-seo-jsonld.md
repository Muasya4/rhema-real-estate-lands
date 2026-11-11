# Phase 11: SEO and JSON-LD

## Status

Implemented locally. Production-origin verification and the manual responsive browser review remain pending.

## Goal

Complete search and social metadata for public pages and add accurate structured data for the business and public content.

## Scope

- Per-route title and description metadata.
- Canonical URLs and social preview metadata using the configured production origin.
- JSON-LD for `LocalBusiness`, `Place`, and `BreadcrumbList` where page data supports it.
- Property and article metadata derived from public records.
- Sitemap and robots behavior if included in the agreed launch checklist.

## Requirements

- Generate metadata on the server from real page and database content.
- Use only confirmed business facts from `AGENTS.md` and `docs/product.md`. The documented phone is `0711634163`; do not invent address, opening hours, coordinates, legal name, or reviews.
- Do not publish placeholder property or journal data in metadata or structured data.
- Use canonical URLs based on an explicitly configured site origin. Do not hard-code a guessed deployment domain.
- Ensure JSON-LD values match visible page content and use the correct schema types.
- Omit unavailable values rather than creating empty, false, or fabricated facts.
- Avoid indexing admin pages, unpublished articles, and non-public property records.

## Acceptance criteria

- Public routes have unique, accurate titles and descriptions.
- Canonical and social URLs use the configured production origin.
- Structured data is valid JSON and accurately reflects visible content.
- Private or unpublished data is absent from page metadata, JSON-LD, and sitemap output.
- Metadata generation handles missing records without exposing internal errors.
- Validate representative pages with structured-data and metadata checks.

## Dependencies

- Phase 02 route structure.
- Phases 03 through 06 public data and publication rules.
- Confirmed public site origin and any additional business details before emitting them.

## Validation

Inspect rendered head tags for home, portfolio, region, property, journal, and contact routes. Validate JSON-LD, canonical URLs, and exclusion of admin/unpublished routes.

## Implementation record

- Added validated `SITE_URL` handling, public-route canonical/Open Graph/Twitter metadata, and non-indexable metadata for missing or unavailable dynamic records.
- Added `LocalBusiness` JSON-LD using the documented business name and phone, `Place` and visible-route breadcrumbs for published property pages, and visible-route breadcrumbs for published journal articles.
- Added a public-only `/sitemap.xml` and `/robots.txt`. Robots allows crawling so crawlers can observe the existing admin `noindex, nofollow` metadata.
- Marked the internal `/design-system` route `noindex, nofollow` and kept it out of the sitemap.
- Automated validation passed: 109 tests, TypeScript, lint, and production build. The build used `https://rhema.test` only as a temporary test origin.
- Local smoke checks returned HTTP 200 for `/contact`, `/design-system`, `/robots.txt`, and `/sitemap.xml`; the contact response contained its canonical/social metadata and business JSON-LD, and the design-system response contained `noindex, nofollow`. The sitemap included public static paths only because no published property or article records were returned in the local check.
- Pending: the production origin has not been selected, so production canonical and sitemap URLs cannot yet be verified. The browser automation endpoint did not connect; visual checks at 375px, 768px, and 1440px remain pending.
