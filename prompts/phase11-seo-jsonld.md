# Phase 11: SEO and JSON-LD

## Goal

Complete search and social metadata for Rhema's public pages, add accurate JSON-LD, and publish a sitemap and robots file without exposing admin or unpublished content.

## Skills read

- `build-editorial-ui`: preserve the existing public layout and validate representative page rendering at 375px, 768px, and 1440px.
- `write-rhema-copy`: keep page descriptions specific to Rhema and grounded in visible content and confirmed facts.
- Next.js 16 local docs: `generateMetadata`, `sitemap.ts`, and `robots.ts`.

## Files and resources inspected

- Instructions and scope: `AGENTS.md`, `docs/specs/phase11-seo-jsonld.md`, `docs/progress.md`, and `docs/product.md`.
- Root and public layouts: `src/app/layout.tsx` and `src/app/(public)/layout.tsx`.
- Public routes: home, properties index/detail, regions, Journal index/detail, and contact pages under `src/app/(public)/`.
- Public data sources: `src/lib/properties/data.ts`, `src/lib/journal/data.ts`, and `src/lib/regions/data.ts`.
- Existing origin configuration: `.env.example` and `src/lib/auth/site-url.ts`.
- Version-matched Next.js docs: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` and the metadata `sitemap.md` and `robots.md` guides.
- `context/ui-registry.md` and the `context/` directory are not present. This scope adds no visual UI; any JSON-LD helper will be a server-only utility.

## Decisions and sources

1. **Require an explicitly configured origin.** Add a separate `SITE_URL` setting for SEO rather than coupling canonical metadata to the auth-specific `AUTH_SITE_URL`. Validate it as a bare HTTPS origin in production; permit localhost HTTP only in non-production. Do not invent a deployment domain or silently fall back to request headers. Source: Phase 11 spec, existing `getAuthSiteUrl()` validation pattern, and the still-unconfirmed production origin.
2. **Use real public records only.** Continue using published-only property and Journal readers for page metadata, JSON-LD, and sitemap entries. Do not expose drafts, future scheduled posts, unpublished properties, admin previews, or placeholder property records. Source: `src/lib/properties/data.ts`, `src/lib/journal/data.ts`, public page rendering, and the existing publication rules.
3. **Complete route metadata.** Keep titles/descriptions factual and distinct for the home, properties, regions, Journal, and contact pages. For property and article detail pages, derive title, description, and social images only from their published records. Add canonical URLs and Open Graph/Twitter fields using the configured origin; omit social images when no real page image exists. Missing or failed detail lookups must not receive canonical URLs or indexable metadata.
4. **Use only confirmed business facts.** Structured business data may include the name `Rhema Real Estates`, the documented phone `0711634163`, the configured site URL, and service areas returned from the public regions reader. Do not add a postal address, opening hours, coordinates, legal name, reviews, or other unverified claims. Source: `AGENTS.md`, `docs/product.md`, and the managed public regions table.
5. **Keep structured data aligned with page content.** Add `LocalBusiness` data with only confirmed values; add `Place` and a `BreadcrumbList` to property detail pages and a `BreadcrumbList` to article detail pages, using the visible route hierarchy and published record values. Escape JSON-LD serialization so record text cannot terminate the script element. Omit unavailable values.
6. **Generate a public-only sitemap.** Include the public static routes and all currently published property and Journal detail routes. Exclude pagination query variants, regions without detail routes, all admin routes, drafts, scheduled articles, and unpublished properties. Do not emit fabricated `lastModified` values; fail visibly rather than return an apparently complete sitemap if a required public data read fails.
7. **Generate robots behavior without blocking noindex directives.** Publish a robots file that allows crawling and points to the configured sitemap. Keep admin routes excluded through their existing `noindex, nofollow` metadata so crawlers can fetch and observe those directives.
8. **Keep internal reference pages out of search.** The `/design-system` route is an internal style reference, so mark it `noindex, nofollow` and exclude it from the sitemap.
9. **Do not add facts or content.** No database migration or new dependency is planned. Do not create sample property or article records. Source: Phase 11 spec and the existing schema/data model.

## Files to touch after approval

- `.env.example`: document the new `SITE_URL` setting.
- `src/lib/seo/site-url.ts`: validate and expose the canonical origin without relying on request hosts.
- `src/lib/seo/json-ld.ts`: provide safe JSON-LD serialization for server-rendered public data.
- `src/app/layout.tsx`: configure the metadata base and site-wide social defaults.
- `src/app/(public)/layout.tsx` and public detail pages: emit supported JSON-LD.
- Public route page files under `src/app/(public)/`: complete accurate metadata, canonicals, social metadata, and non-indexable missing/error detail states.
- `src/app/design-system/page.tsx`: mark the internal reference page non-indexable.
- `src/app/sitemap.ts` and `src/app/robots.ts`: generate public-only sitemap and crawler instructions.
- `tests/seo/` and the existing test runner: cover origin validation, metadata/JSON-LD output, and sitemap privacy rules.
- `docs/specs/phase11-seo-jsonld.md`, `docs/progress.md`, and the `## Known issues` section in `AGENTS.md`: record delivered scope, validation, and any deployment checks still pending.

No Supabase schema change, new package, or visual redesign is planned.

## Acceptance criteria

- Every public route has accurate, distinct metadata, canonical URLs, and appropriate Open Graph/Twitter data when a real image is available.
- Absolute SEO URLs use only the explicitly configured production origin.
- `LocalBusiness`, `Place`, and `BreadcrumbList` JSON-LD contain valid, safely serialized JSON and only facts supported by the page or project documentation.
- Sitemap output contains only public routes and published records. It excludes admin routes, unpublished properties, drafts, and future-scheduled articles.
- Admin routes remain `noindex, nofollow`, and robots rules do not prevent crawlers from seeing those directives.
- The internal design-system route is not indexable and is absent from the sitemap.
- Missing and unavailable dynamic records do not produce indexable or canonical metadata for non-public content.
- Errors reading required sitemap data or validating a production origin are surfaced explicitly.
- No invented address, hours, coordinates, reviews, property details, or publication dates are introduced.

## Validation and manual test steps

1. After the production origin is confirmed, set `SITE_URL` locally for metadata tests and provide the same exact HTTPS origin in the eventual production environment.
2. Add focused tests for valid/invalid origins, JSON-LD escaping and shapes, canonical/social metadata, and sitemap inclusion/exclusion of published versus non-public records.
3. Run targeted SEO tests, `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
4. Run the application with the configured origin. Inspect rendered `<title>`, description, canonical, Open Graph/Twitter tags, and JSON-LD on home, properties, regions, a published property, Journal, a published article, and contact.
5. Request `/sitemap.xml` and `/robots.txt`; verify the sitemap uses the exact origin and excludes admin, unpublished, and scheduled records, and verify robots points to the sitemap without blocking admin `noindex` metadata.
6. Confirm an unknown or unpublished property/article has no canonical URL or public structured data and remains not found.
7. Review representative pages at 375px, 768px, and 1440px. SEO changes should not alter the editorial layout.
8. If no staging admin/database setup is available, mark hosted-data checks as pending instead of claiming they passed.

## Approval required

Approve this plan before implementation. The exact production site origin is also required before verifying canonical and sitemap URLs. If it has not been selected yet, the implementation can proceed with the setting documented and local checks configured, but production-origin validation will remain pending.

## Approval and implementation status

- Plan approved.
- Production origin: not selected yet.
- Implemented locally. See `docs/progress.md` and `docs/specs/phase11-seo-jsonld.md` for validation results and pending production checks.
