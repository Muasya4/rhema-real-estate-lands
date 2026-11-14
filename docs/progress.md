# Project Progress

## Phase specification roadmap

Created the ordered implementation specs in `docs/specs/` for the design system, shared shell, schema, public property and journal pages, inquiries, admin authentication and management, and SEO. The specifications define scope; implementation status is recorded below.

## Critical next task: enable production inquiry submissions

The public form protections and the admin-only `/admin/inquiries` inbox are implemented locally. The live Contact page still reports that the form is unavailable. The production environment must be configured and the code deployed before submissions and the inbox can be verified against hosted data.

The following values must be configured in the Vercel **Production** environment:

- `SUPABASE_SECRET_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_SITE_KEY`

Set these directly in Vercel; never paste secret values into chat, Git, or project documentation. Redeploy after saving. Then sign in as an admin and open `/admin/inquiries`. After separate owner approval, submit one synthetic inquiry and confirm it appears in the inbox. Keep inquiry table access admin-only; do not enable anonymous direct inserts. See `prompts/critical-live-inquiry-setup.md` and `prompts/inquiry-flow-admin-inbox.md`.

Decisions and issues to track before related implementation:

- **Resolved in Phase 03:** The original 11 service areas, now stored as admin-managed regions with stable slugs. Property status nullability, nullable KES price, property/blog publication semantics, image record shape, and image bucket access policies are also defined.
- **Phase 09 implementation:** The admin editor enforces 5 MiB per image and JPEG, PNG, or WebP. Apply the same bucket-level limits in the Supabase Dashboard and verify them in staging.
- **Phase 07:** Public inquiry submissions use the validated server action, Turnstile, and honeypot. Direct anonymous writes to the inquiries table remain disabled.
- **Resolved for Phase 11:** The canonical origin is `https://www.rhemarealestates.com`. The domain is connected to Vercel, Auth URLs use the `www` origin, and live canonical and sitemap URLs were checked.
- **Unresolved:** The Phase 03 and admin-managed-regions migrations and pgTAP tests are present but the pgTAP suite still needs to run against Supabase.
- **Resolved for now:** Cormorant Garamond did not download during build; the design system uses a system serif stack. Self-hosting a font remains a pre-launch improvement, not a blocker for the current page.

## Home page

Expanded `/` into a fuller editorial entry point with portfolio information, a regional directory, enquiry guidance, and published journal posts when available. The page does not display fictional properties, prices, or article content.

The home page uses the existing abstract contour illustration without temporary labels. Published property records without photos render without fallback artwork.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Browser layout and overflow checks at 390px, 768px, 1024px, and 1440px.
- Screenshot review of the home page and journal cards at mobile, tablet, and desktop sizes.
- Confirmed the local contour illustration loads.

## Phase 02: Layout shell

Implemented a shared header and footer for the public site, plus the `/properties`, `/regions`, `/journal`, and `/contact` routes. The home page now links to implemented public routes where appropriate. `/design-system` remains outside the public shell.

Properties and Journal show clear empty states because property records and published articles are not available yet. Regions uses only the supplied service areas. Contact uses the documented `0711634163` call and WhatsApp options. Property and journal detail routes remain planned for Phases 05 and 06.

Validation completed:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`, with all public routes included in the static route output.
- An HTTP request to `/regions` returned 200.
- Browser automation timed out, and a sequential development-server route check stalled. Responsive screenshots and keyboard navigation still require manual browser review.

## Phase 03: Properties schema

Added versioned schema and RLS migration `supabase/migrations/20261106194113_initial_content_schema.sql` for properties, inquiries, journal posts, and admin roles. Added `supabase/tests/database/content_schema_test.sql` with pgTAP checks for schema shape, publication visibility, grants, RLS behavior, Storage configuration, update timestamps, and foreign-key deletion behavior. Added `src/lib/properties/images.ts` to validate the image JSON shape at the TypeScript boundary. Added `docs/supabase-test-project.md` with steps to test using a disposable Supabase project.

The initial region enum used the 11 service areas documented in `AGENTS.md`. The admin-managed-regions migration converts those values to stable region slugs and seeds `public.regions` while preserving property references. Property prices are nullable `bigint` whole KES, missing status stays nullable, properties default to unpublished, and journal posts use nullable publication timestamps. Public inquiry insertion is deliberately disabled until Phase 07 provides abuse controls. Admin roles are not self-service.

Validation completed:

- Applied the application-table migration to a disposable PostgreSQL 18 instance with minimal Supabase-compatible Auth objects.
- Manually verified anonymous and authenticated non-admin users see only published properties/articles; non-admin users cannot read inquiries or admin roles; admins can read drafts and inquiries.
- Verified an authenticated non-admin property insert is rejected by RLS.
- Verified database grants deny anonymous inquiry read/insert and authenticated admin-role insertion.
- Stopped and removed the disposable PostgreSQL instance and its temporary files.
- The final SQL change rejecting absolute URLs in image paths was made after the harness run. Its corresponding pgTAP assertion has not been executed against a database.

Validation still pending:

- The Supabase CLI, Docker, and pgTAP are not installed. The pgTAP suite could not be executed against a local Supabase stack.
- The temporary hosted development project is configured and the app's anonymous read connection is verified. Apply the migration and run `supabase test db` in a configured non-production environment before depending on all schema guarantees.
- The user's first temporary-project SQL run failed with `42501: must be owner of table objects`. The four application tables were absent afterward. The migration has been corrected to avoid modifying Supabase-managed Storage tables; create the public bucket and admin policies in the Dashboard as documented in `docs/supabase-test-project.md`.

## Development Supabase client

Added a server-only Supabase client factory using a pinned `@supabase/supabase-js` dependency and the development project's URL and publishable key. Added `.env.example` with variable names only; `.env.local` remains ignored and no credentials or privileged key are stored in the repository. The client rejects missing or invalid configuration and does not allow secret/service-role keys.

Verified the app connection against the hosted development project with a bounded anonymous read of `properties` (`select id`, limit 1). The request succeeded and returned zero rows, confirming connectivity while showing that no property records are currently available. No database writes or production project changes were made.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- A read-only anonymous properties query returned successfully with zero rows.
- Confirmed `.env.example` is not ignored and `.env.local` remains ignored.

## Phase 04: Property listing

Implemented `/properties` as a server-rendered listing that reads only published records with the anonymous server client and remains subject to database RLS. Records are ordered featured-first and newest-first. The request-time database read sits behind a Suspense boundary and a Next.js `io()` boundary, so it is excluded from static prerendering. The page has distinct empty and read-error states. Cards use stored location, status, price, size, and the first stored image; null values are omitted or rendered as `Price on request`. Records without uploaded imagery show no image artwork.

Added a property record parser and KES formatter with focused tests. Public Storage image URLs are generated through Supabase Storage, and Next Image remote access is scoped to the configured project host and `property-images` public path. No database writes were made and no additional inquiry was submitted.

Validation completed:

- `npm test`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Browser viewport review at 375px, 768px, and 1440px.

Known issues:

- **Unresolved:** The development database currently has no published property records, so the live page shows the empty state. The `/properties/[slug]` detail route is implemented and will show records when they are published.
- **Resolved:** Suspense alone allowed the Supabase client to turn Next.js prerender cancellation into a query error. Adding Next.js `io()` before the request keeps database access out of prerendering; the final build completed without listing-read errors.

## Phase 05: Property detail

Implemented `/properties/[slug]` as a server-rendered detail page. It looks up the exact slug, filters to published records through the anonymous Supabase client and public RLS policy, and returns a not-found page for missing or unpublished slugs. Property facts come only from the matching record. Missing prices display as `Price on request`, optional size and status are omitted, and empty image arrays use the labeled local illustration. Stored image order and alt text are preserved.

The detail page includes property-specific metadata, a responsive image gallery and facts layout, and the inquiry form with the property's UUID. The existing server action continues to verify that the supplied UUID belongs to a published property before inserting. The general `/contact` flow remains unassociated. No database rows were changed and no inquiry was submitted.

Validation completed:

- `npm test`: 28 tests passed, including exact-slug/publication filters, not-found and query-error outcomes, ordered images, missing-image handling, metadata description, and existing property-specific inquiry validation.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Production browser review at 375px, 768px, and 1440px found no horizontal overflow on the live empty portfolio and missing-property views.
- The development database still has no published property records, so the detail page's found state was verified with mocked data tests rather than a live listing.

Known issue:

- **Accepted limitation:** Next.js 16 Cache Components streams the partial-prerendered shell before the on-demand slug lookup completes. The unknown-slug request renders the correct not-found UI and `noindex` metadata, but the HTTP response is `200`, as documented for `notFound()` after streaming starts. The user chose to keep streaming rather than make a broader rendering change. No draft or unpublished property data is returned.

## Phase 06: Public Journal

Implemented `/journal` with newest-first published articles and 12-item URL pagination, and `/journal/[slug]` with stored title, excerpt, body, cover image when present, and publication date. Both public reads use the anonymous Supabase client and retain the Phase 03 published-date RLS boundary. Article content is sanitized with an explicit HTML allowlist; unsafe tags, event handlers, and unsafe link schemes are removed. Unknown and unpublished slugs share the same not-found view.

The home page now shows up to three real published articles. Its planned-topic cards remain when the public query confirms there are no published articles. Query failures render an explicit error state instead of appearing as an empty result. Missing cover images are omitted rather than replaced with invented imagery.

Validation completed:

- `npm test`: 65 tests passed, including Journal parsing, publication filtering, pagination, errors, cover paths, and sanitization.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`; `/journal` and `/journal/[slug]` are partial-prerendered routes.
- Reviewed the empty Journal page at 375px, 768px, and 1440px; measured no horizontal overflow.
- Confirmed unknown article slugs render the custom not-found view without article content.

Known issues:

- **Pending live-content verification:** The development database has no published posts, so populated index/detail pages, storage cover images, home-page article cards, and real multi-page navigation were tested with mocks rather than live records.
- **Pending Phase 10:** Admin article creation and publishing are not implemented. No article records or images were created during Phase 06.
- **Resolved:** The first build found pagination `searchParams` read before the Journal route's Suspense boundary. The read now happens inside Suspense; the final build succeeds.
- **Accepted limitation:** When `notFound()` runs after a streamed response starts, Next.js Cache Components may return HTTP 200 with the custom not-found UI. The route does not return unpublished article content.

## Design system foundation

Implemented the editorial design tokens in `src/app/globals.css`, reusable UI components in `src/components/ui/`, and a responsive `/design-system` showcase.

The showcase documents the palette, spacing, typography, radii, elevation, navigation, buttons, form fields, status badges, and property and journal card specimens. Display typography uses a system serif stack because the attempted Cormorant Garamond font download timed out during production build.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Headless browser review at desktop and mobile widths, including the component showcase

## Phase 07: Inquiry forms

Implemented a general inquiry form on `/contact`. The form validates input in a server action, checks any supplied property ID against published properties, verifies Cloudflare Turnstile server-side, uses a honeypot, and inserts through a server-only Supabase secret client. Anonymous direct inquiry-table writes remain disabled; no migration or RLS policy was changed. The form retains phone and WhatsApp alternatives and provides pending, success, and failure states.

Added a protected, read-only `/admin/inquiries` inbox. It uses the authenticated Supabase server client and existing admin-only RLS policy, and displays the visitor's message and contact details, receipt time in Nairobi time, and an admin property link when associated. The admin landing page links to the inbox. No inquiry policies or database schema were changed.

Added focused Node tests for form validation, mocked general/property-specific inserts, unpublished-property rejection, Turnstile failure and replay, honeypot handling, and insert errors. One owner-confirmed test inquiry is present in the active Supabase project and was left untouched.

Validation completed:

- `npm test`: 147 tests passed, including admin inquiry mapping, property association, query failures, and unavailable configuration.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build` with a temporary isolated output directory; `/admin/inquiries` appears as a partial-prerendered route.
- The signed-out local `/admin/inquiries` response redirects to `/admin/login`.
- Local `/contact` renders the configured form, but the integrated browser could not complete Cloudflare Turnstile (`300010`); no inquiry was submitted. An authenticated admin session was not available to review real inbox records or its responsive rendering.

**Critical production blocker:** Live Turnstile verification and a hosted inquiry insert have not been tested. The live Contact page reports the form unavailable. The production Vercel environment still needs `SUPABASE_SECRET_KEY`, `TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY`. The action fails closed until these are set. Configure them directly in Vercel Production, redeploy, then sign in and open `/admin/inquiries`. Submit one synthetic inquiry only after owner approval. Do not put secrets in `.env.example` or share them in chat.

## Phase 08: Admin authentication

Implemented private email/password sign-in, a password visibility toggle, password recovery by email, a PKCE callback, password reset and global session revocation, sign-out, and a protected admin landing page. Public registration and self-service admin provisioning are absent. Admin pages and actions verify the user through Supabase Auth and then query the current `admin_roles` row under RLS. The Next.js proxy refreshes sessions but is not the authorization boundary.

Password-only was selected by the user instead of MFA. New passwords require at least 15 characters with no composition rules. Sign-in failures are generic; accepted recovery requests use the same response regardless of account existence. Recovery redirects use the configured `AUTH_SITE_URL` rather than the request host. If global session revocation fails after a password change, the local session is cleared when possible and an explicit warning is shown rather than a success-only message.

Validation completed:

- `npm test`: 40 tests passed, including authorization checks, generic recovery behavior, callback URL safety, password update, and failed global session-revocation handling.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev`: 0 production dependency vulnerabilities.
- Browser review of sign-in at 375px, 768px, and 1440px found no horizontal overflow; the password toggle revealed and re-masked the field. Recovery and reset pages rendered. Unauthenticated `/admin` navigation returned to sign-in. Keyboard navigation reached the sign-in controls.
- No recovery email was requested, no live account was created, and no Supabase settings or database rows were changed.

Deployment prerequisites are recorded in `docs/specs/phase08-admin-auth.md`: disable public sign-ups, configure email confirmation and a 15-character password minimum, set Auth rate limits/abuse controls, configure verified SMTP and the exact callback allowlist, set `AUTH_SITE_URL`, provision an admin through the trusted process, and run the live staging scenarios.

## Phase 09: Admin properties

Implemented protected admin property listing, creation, and editing. Every admin page and server action verifies the current admin role. Reads and writes use the cookie-bound authenticated Supabase client and remain subject to the existing database and Storage RLS policies. The editor supports managed region choices, nullable price/size/status fields, featured and publication controls, plain-text descriptions, and ordered images with editable alt text.

Property fields are validated server-side, including slug shape, unique-slug errors, safe whole-KES values, and schema status/region values. Image uploads accept one JPEG, PNG, or WebP per save, are limited to 5 MiB, and are checked against file signatures. New objects use opaque property-scoped paths. Failed record writes trigger cleanup of new uploads; replaced or removed objects are deleted only after the record update. Cleanup failures are reported without hiding the persisted result.

Set the `property-images` bucket's maximum file size to 5 MiB and allowed MIME types to `image/jpeg`, `image/png`, and `image/webp` in the Supabase Dashboard as documented in `docs/supabase-test-project.md`. Do not modify Supabase-managed Storage tables through a migration.

Validation completed:

- `npm test`: 53 tests passed, including validation, unauthorized mutation rejection, duplicate slugs, upload failures, image signature/size checks, save cleanup, ordered image persistence, and removal failures.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`; protected admin property routes are included in the partial-prerendered route output.
- Production browser review confirmed an unauthenticated `/admin/properties` request redirects to admin sign-in, and the public properties route remains in its empty state. No authenticated admin session was available for editor or responsive-flow review.

Known issue:

- **Pending staging verification:** No live property write, image upload/removal, non-admin denial, or public visibility transition was performed. Configure and verify the Dashboard bucket limits and admin Storage policies in a non-production Supabase project, then run the manual scenarios in `docs/specs/phase09-admin-properties.md`.

## Admin regions and automatic property slugs

Implemented admin controls to add, rename, and delete regions. Region names and ordering now come from the database on the property forms, home page, and `/regions`. Property region slugs remain stable when their display names change. Database RLS restricts region writes to admins, and a restrictive property foreign key prevents deleting a region that is still in use.

New property forms generate slugs from the title while the admin types. Manual edits stop automatic updates, and existing property slugs remain unchanged when only the title is edited. The shared slug helper is documented as a Phase 10 blog-editor requirement; the blog editor itself remains planned.

Validation completed:

- `npm test`: 85 tests passed, including generated slugs, dynamic region parsing, admin region actions, duplicate names, region deletion restrictions, and stale-region property errors.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`; `/admin/regions` and the dynamic public `/regions` route are included in the partial-prerendered output.
- Browser viewport checks at 375px, 768px, and 1440px found no horizontal overflow on the home and regions pages. Signed-out `/admin/regions` redirects to admin sign-in.

Known issues:

- **Verified locally:** Both migrations were applied to a disposable PostgreSQL 18 compatibility database after inserting one property row for each of the 11 old enum values. All 11 references mapped to the expected stable slugs. Anonymous and non-admin region reads, non-admin write denial, admin create/rename/delete, and foreign-key deletion restriction passed.
- **Pending Supabase test run:** The pgTAP suite could not run because pgTAP and a local Supabase stack are unavailable. The configured development database still does not have the new `regions` table, so `/regions` shows its explicit read-error state until the migration is applied there. No hosted schema or data was changed.
- **Pending authenticated review:** An admin session was not available, so the region manager and property slug controls could not be exercised in the browser. Automated tests cover slug generation and the region server actions.

## Phase 10: Admin Journal

Implemented a protected Journal article list, create/edit form, and admin-only preview. New slugs follow the title until edited. The editor supports the markup already allowed by the Journal sanitizer. Publication uses the existing `published_at` semantics: drafts and unpublished articles use `null`, published articles use a timestamp at or before now, and scheduled articles use a future timestamp. Schedule input is interpreted as Africa/Nairobi time.

Cover images use the existing `property-images` bucket with the same 5 MiB and JPEG/PNG/WebP checks as property images. Uploads use article-scoped opaque paths; replacing or removing a cover happens only after the post update succeeds. Public Journal paths are revalidated after saves. No schema migration or dependency was added.

Validation completed:

- `npm test`: 101 tests passed, including Journal admin validation, protected mutations, publication transitions, duplicate slugs, and upload/write/cleanup failures.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`; protected Journal management, edit, and preview routes were included in the partial-prerendered output.
- Production browser checks confirmed `/admin/journal/new` redirects signed-out visitors to admin sign-in and the public Journal page has no horizontal overflow at 375px, 768px, and 1440px.

Known issues:

- **Pending authenticated review:** No admin session was available to review the article form and preview in the browser or exercise live Supabase writes and Storage uploads. Complete the manual checks in `prompts/phase10-admin-blog.md` using a non-production project.
- **Accepted Storage limitation:** Cover images use the public `property-images` bucket, so anyone with an image URL can fetch a draft cover. Do not upload confidential images.
- **Resolved validation environment issue:** An existing Next.js dev server prevented starting a second dev server and returned HMR WebSocket errors. The production build server on another port was used for browser checks instead.

## Phase 11: SEO and JSON-LD

Implemented locally. Public pages now have route-specific canonical and social metadata based on `SITE_URL`. Published property and article pages derive metadata from their published records. Structured data includes confirmed Rhema business name and phone, published property `Place` data, and breadcrumbs matching the visible detail-page hierarchy. `/sitemap.xml` includes public static routes and published property/article routes; `/robots.txt` links to the sitemap without blocking crawlers from reading admin `noindex` metadata. The internal `/design-system` route is also `noindex, nofollow` and excluded from the sitemap.

Validation completed:

- `npm test`: 109 tests passed, including URL validation, metadata shapes, JSON-LD escaping, sitemap inclusion/exclusion, error handling, and robots output.
- `npx tsc --noEmit`
- `npm run lint`
- `SITE_URL=https://rhema.test npm run build`; this reserved test origin was used only for local validation and is not the production domain.
- Local HTTP checks returned 200 for `/contact`, `/design-system`, `/robots.txt`, and `/sitemap.xml`. The rendered contact response contained its canonical, Open Graph, Twitter, and `LocalBusiness` JSON-LD values; the design-system response contained `noindex, nofollow`. The sitemap contained the public static routes and no admin or pagination URLs.

Known issues:

- **Resolved production origin:** `SITE_URL` is set for `https://www.rhemarealestates.com`; the production canonical and sitemap URLs were verified on the live site.
- **Pending browser review:** The browser automation connection timed out. Visual checks at 375px, 768px, and 1440px and rendered metadata checks on published property/article records remain pending. No live published records were present in the local sitemap smoke check.


## Known issues

- **Font loading:** Cormorant Garamond failed to download during build, falling back to system serif. Fix: self-host with `next/font/local` before launch.
- **Phase 02 browser review:** Automated browser connection timed out during this pass. Production build and static route generation passed, and `/regions` returned HTTP 200. Mobile/tablet screenshots and keyboard review remain to be done manually.
- **Phase 03 Supabase validation:** The user's first test-project SQL run failed because the migration tried to change ownership-managed Storage objects. The migration now avoids those operations. Application schema passed on a disposable PostgreSQL compatibility harness before this correction. The corrected file and Dashboard Storage setup still need verification on a clean temporary project; no client DB was touched.
- **Production Supabase plan:** The existing active Free project is being used by the live site. Supabase may pause Free projects after inactivity, and downloadable database backups are not included. The owner has chosen to remain on Free for now.
- **CRITICAL: Phase 07 production inquiry setup:** The admin-only `/admin/inquiries` inbox is implemented locally. The live Contact page still reports the form unavailable until `SUPABASE_SECRET_KEY`, `TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY` are configured in Vercel Production and the code is deployed. Then verify admin inbox access and, after owner approval, submit one synthetic inquiry. Keep direct anonymous inquiry-table writes disabled.
- **Phase 05 not-found status:** Accepted limitation. Unknown and unpublished property slugs render the correct not-found UI with `noindex`, but streamed responses return HTTP 200 under Next.js Cache Components. The user chose to keep streaming instead of changing the broader rendering strategy.
- **Phase 08 live Auth setup:** `AUTH_SITE_URL` is intentionally blank in `.env.example`. Production SMTP, the Auth callback allowlist, sign-up/confirmation/password policies, rate limits, CAPTCHA/abuse protection, trusted admin provisioning, and live staging flows still require owner setup and verification. No live recovery email or account test was performed.
- **Phase 08 password-only decision:** The user declined MFA. This is less resistant to credential theft than MFA and should be treated as an accepted risk, not as an equivalent security control.
- **Development dependency audit:** The full `npm audit` reports eight moderate advisories in the ESLint/TypeScript linting dependency chain. `npm audit --omit=dev` reports zero production vulnerabilities. The suggested automatic fix would downgrade `eslint-config-next` to 15.5.29, so no forced or unrelated dependency change was made; update to a tested compatible release before relying on the lint toolchain in CI.
- **Phase 09 staging:** The implementation is locally validated, but the development/staging Storage bucket limits and policies and live admin property workflows still need owner setup and verification. No hosted property or Storage data was changed.
- **Managed regions database verification:** The migration and core RLS behavior passed in a disposable local PostgreSQL 18 harness with pre-existing property data. The expanded pgTAP suite still needs a Supabase-compatible run. No hosted schema or data was changed.
- **About page and CEO profile:** The page and protected editor are implemented locally. The leadership migration and RLS passed an isolated PostgreSQL 18 smoke test. The pgTAP suite, authenticated UI/Storage workflows, and responsive browser review remain pending. The migration has not been applied to hosted Supabase.
- **Resolved for homepage depth validation:** An initial local build without `SITE_URL` exited because the required canonical origin was missing. The build passed with the reserved test origin `https://rhema.test`; no application configuration changed.
- **Pending direct homepage browser review:** A fresh local production-preview request for `/` ended with `ERR_INCOMPLETE_CHUNKED_ENCODING`. The generated HTML contains the homepage class, and the compiled styles were checked in a browser using the homepage markup fixture. A complete direct-route screenshot remains pending.

## Homepage and design-system depth

Applied the new reference's section depth to the homepage and `/design-system`, using existing tokens and leaving both font stacks, all copy, routes, and data behavior unchanged. The homepage now uses a layered hero image frame, a raised portfolio panel, and individually surfaced region tiles. The showcase demonstrates the olive feature band and muted palette section.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `SITE_URL=https://rhema.test npm run build`
- Production browser review of `/` and `/design-system` at 375px, 768px, and 1440px found no horizontal overflow.
- Browser-computed heading and body font families match the existing serif and Geist stacks.
- Local production server returned HTTP 200 for `/`.

## Deep green and public-page depth

Added `--color-forest` (`#193d32`), sampled from the deep green feature band in the new design reference. The token is now documented in the design-system color inventory and used by shared public navigation/footer states, the homepage hero and contact band, public route introductions and detail headers, region surfaces, and inquiry panels. Added a forest button specimen and a visible hover/focus navigation example to `/design-system`.

Removed the offset olive frame around the homepage hero photo. Existing type stacks, page copy, routes, data behavior, and admin surfaces remain unchanged.

Validation completed:

- `npx tsc --noEmit`
- `npm test`: 109 tests passed.
- `npm run lint`
- `SITE_URL=https://rhema.test npm run build`
- Browser review of home, design system, properties, regions, journal, and contact at 375px, 768px, and 1440px showed no horizontal overflow.
- Browser checks confirmed the forest token, hero and route-intro colors, removed image-frame padding, and unchanged serif/sans font stacks.
- The production browser automation experienced intermittent local navigation errors. Direct HTTP requests to the six reviewed public routes each returned 200; browser layout checks succeeded on every route.

## Homepage hero, olive accents, and footer contrast

Reduced the homepage hero's padding, title scale, column gap, and image height. The shared header divider is now hidden only above the homepage, with a token-based gap before the hero. The existing soft-olive headline highlight is reinforced by a small location marker; olive is used for small image-label and enquiry-step details. The design-system palette guidance now documents olive for light-surface accents and soft olive for highlighted wording on forest.

Corrected the footer foreground rule so the brand descriptor, navigation, and phone text remain white over the forest background. Existing font families and customer-facing page copy remain unchanged; non-home route headers are unaffected.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test` passed.
- `SITE_URL=https://rhema.test npm run build`
- Browser layout checks with the compiled CSS and homepage markup fixture at 1440×900, 768×900, and 375×812 found no horizontal overflow. The full hero was visible at 1440×900 and 768×900.
- Browser-computed title highlight color was soft olive (`#e5e9e1`); footer text and brand descriptor were white against forest (`#193d32`).
- `/design-system` rendered the olive role guidance and showed no horizontal overflow at all three viewport widths.
- A fresh direct homepage request in the isolated local production preview ended with `ERR_INCOMPLETE_CHUNKED_ENCODING`; see Known issues above. The responsive hero check used the compiled stylesheet on a browser fixture rather than a complete homepage response.

## Mobile navigation

Replaced the public header's wrapping links on mobile with a compact menu control and an expandable route list. The public header remains server-rendered; menu state, Escape handling, and focus restoration are isolated in a client component. The panel closes after route selection, is inert when closed, and disables its transitions for reduced-motion preferences. Added an interactive mobile-header specimen to `/design-system`.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `SITE_URL=https://rhema.test npm run build`
- The production preview returned HTTP 200 for `/design-system`.
- The build completed successfully, but took about 4.8 minutes to compile and 6.2 minutes for its TypeScript step while lint and a separate type check were also running.

Still pending: the integrated browser automation could not connect to its CDP endpoint. Screenshots, menu interaction, and viewport-specific checks at 375px, 768px, and 1440px could not be completed.

## About page and CEO profile

Added `/about` with company-specific information and a profile section for Evans, Chief Executive Officer. Added the protected `/admin/about` editor for the confirmed name, title, email, optional biography, and portrait. Portrait uploads reuse the existing public-read/admin-write `property-images` bucket. The local leadership migration seeds `evans@rhemarealestates.com`, permits public reads, and restricts updates to admins.

Validation completed:

- `npm test`: 120 tests passed.
- `npx tsc --noEmit`
- `npm run lint`
- `SITE_URL=https://rhema.test npm run build`; `/about` and `/admin/about` are included in the production route output.
- Applied the leadership migration to an isolated local PostgreSQL 18 harness. Verified the seed, public read, no anonymous update privilege, blocked non-admin update, and successful admin update.
- `git diff --check`

Still pending: the pgTAP suite and authenticated editor/Storage workflows need a Supabase-compatible test project. The migration has not been applied to hosted Supabase. Responsive browser review at 375px, 768px, and 1440px remains pending because integrated browser automation timed out; local SSR without the migration reported the missing leadership table.

## Public site content management

Narrowed the protected `/admin/content` editor to public page-section headings and descriptive copy. Admins can replace the homepage hero and portfolio images, update their descriptions, and restore one section at a time. Header, navigation, footer, actions, forms, metadata, system messages, destinations, and record-owned content remain outside this editor.

The public content reader ignores previously saved overrides for the now-protected fields. Image uploads reuse the existing public-read/admin-write `property-images` bucket, existing 5 MiB JPEG/PNG/WebP validation, and the `site_content` table. No new database migration or hosted data change was made.

Validation completed:

- `npm test`: 141 tests passed.
- `npx tsc --noEmit`
- Targeted `npx eslint` on the changed application and test files.
- `SITE_URL=https://rhema.test npm run build`; all public and admin routes generated successfully.
- `git diff --check`

The full `npm run lint` command did not finish during this run; targeted lint on the changed files passed. Responsive browser review at 375px, 768px, and 1440px remains pending because integrated browser automation timed out connecting over CDP. The hosted status of the existing site-content migration is unconfirmed, and authenticated image upload/save/restore still needs a Supabase-compatible test project. No hosted database changes or content writes were made.

## Client presentation cleanup

Removed photography-to-be-added and temporary image labels, removed unpublished journal-topic teasers from the home page, and hid the home journal section when there are no published posts. The approved abstract home illustrations remain. Property cards and detail pages no longer render local placeholder artwork when published property records have no uploaded images.

Validation completed:

- `npm test`: 142 passed.
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `git diff --check`

Responsive browser review at 375px, 768px, and 1440px remains pending because integrated browser automation could not connect over CDP.

## Zoho Mail handoff guide

Added `ZOHO-FREE-SETUP-FOR-EVANS.md` as the client-facing checklist and `ZOHO-CLOUDFLARE-DEVELOPER-RUNBOOK.md` for the developer's DNS work. The original `ZOHO-FREE-EMAIL-SETUP.md` remains the detailed reference. Evans owns the Zoho account; the developer uses their own authorized Cloudflare access and only the account-specific records Zoho provides. The guides warn against changing website DNS, switching existing mail without approval, or sharing credentials.

Zoho currently lists Free Forever for one custom domain and up to five users, with 5 GB per mailbox and no IMAP/POP/ActiveSync. If Zoho does not offer Free during signup, Evans should stop rather than start a trial or select a paid plan. No Zoho account or DNS settings have been changed. Zoho Free SMTP availability has not been confirmed, so do not configure it for Supabase Auth without verifying support and terms. The mailbox does not create website-admin access or deliver website inquiries by email; inquiry notifications are not implemented.

## Design system V2 adoption

The client-approved black-and-gold system is now applied through shared semantic tokens across public and admin surfaces. The public editorial typography, spacing, and page behavior remain in place. `/design-system` documents the shared token inventory and reusable components; `/design-system-v2` remains a noindex visual showcase using its route-local CSS module. The palette values are adopted interface values derived from the supplied reference and client direction, not a separate official brand specification.

The initial isolated preview validation completed:

- `npx tsc --noEmit`
- `npx eslint src/app/design-system-v2/page.tsx`
- `$env:SITE_URL='https://www.rhemarealestates.com'; npm run build`
- Direct HTTP request to `/design-system-v2` returned 200 and the expected page title and hero heading.

Rollout validation completed:

- `npx tsc --noEmit`, `npm run lint`, and `npm test` passed.
- The production build passed with a temporary isolated `distDir`. A build using the default `.next` directory first failed with `EPERM` while an existing development server was using that output.
- An HTTP request to `/design-system-v2` returned 200 with the adopted design-system title.
- Responsive screenshot and interaction review at 375px, 768px, and 1440px remains pending because integrated browser automation could not connect over CDP.

## Public site editorial redesign

Redesigned the public home, About, property listing/detail, regions, journal listing/article, and contact layouts with page-specific editorial structure and responsive styling. The About page and admin preview render Evans's uploaded portrait in a circular crop when an image is present. Existing content, routes, records, inquiry behavior, and portrait upload rules are preserved.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`: 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` completed successfully using a temporary isolated output directory; the temporary directory and generated `tsconfig.json` changes were removed.
- `git diff --check`

Responsive browser screenshots and interaction checks at 375px, 768px, and 1440px remain pending because integrated browser automation timed out connecting over CDP. The circular crop with an uploaded portrait and authenticated admin upload/save flow were not verified. No hosted database changes, uploads, or permission changes were made.

### Homepage hero first-screen refinement

Reduced homepage hero typography, spacing, and image height so the copy, actions, image, and caption fit in the initial 1200×450 browser viewport. Removed the `01` overlay from the hero image and replaced its square frame with an organic, token-bordered shape. The separate portfolio image marker is unchanged.

Validation completed:

- Shared browser screenshot at 1200×450 showed the full header and hero content in the first screen.
- `npx tsc --noEmit`
- `npm run lint`
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed with a temporary isolated output directory; temporary build files and generated TypeScript configuration changes were removed.
- `git diff --check`

Screenshots at 375px, 768px, and 1440px could not be captured because the browser automation connection timed out. The hero is responsive by CSS, but those viewport sizes remain unverified.

### Sculpted homepage hero image

Replaced the previous oval-like hero image with a reusable asymmetrical SVG-clipped silhouette and layered gold contours inspired by the supplied reference. The admin hero-image preview uses the same component, including for its existing local object-URL preview before save. Removed the line above the homepage hero caption only. Portfolio and other admin image previews remain rectangular.

Validation completed:

- Homepage desktop screenshot showed the sculpted contour and no divider above the hero caption.
- `npx tsc --noEmit`
- `npm run lint`
- `npm test`: 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory; temporary build output and generated `tsconfig.json` changes were removed.
- `git diff --check`

Known issues:

- Browser automation timed out connecting over CDP while navigating to `/admin/content`. Admin preview interaction and responsive screenshots at 375px, 768px, and 1440px remain unverified.

### Remove decorative numbering and restyle Regions

Removed the `02` marker from the homepage portfolio image and removed index numbers from the homepage and `/regions` lists. Kept `01–03` on the enquiry guide to retain the process order. Replaced region tiles with open, text-led lists and fine separators.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`: 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory; temporary build output and generated `tsconfig.json` changes were removed.
- `git diff --check`
- Source search confirms the only remaining decorative sequence labels are the enquiry step numbers 01–03.

Known issues:

- Browser automation could not navigate to the updated Regions page, and bounded direct HTTP checks of the local homepage and Regions route did not complete. Visual review at 375px, 768px, and 1440px remains pending.

### Remove Regions illustration

Removed the survey-line drawing from both the homepage and `/regions` after client review. The region lists remain open and unboxed with fine separators; no replacement illustration was added. Existing region data, ordering, and enquiry step labels remain unchanged. Deleted the now-unused illustration component and layout CSS.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`: 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory; temporary build output and generated `tsconfig.json` changes were removed.
- `git diff --check`

Known issues:

- Browser navigation and bounded direct route checks did not complete. Visual confirmation of the resulting spacing at 375px, 768px, and 1440px remains pending.

### Homepage Land portfolio framing

Removed the portfolio image's stacked square frames and padded card styling while retaining its caption and section divider rules. Improved the copy spacing for narrow screens. At widths up to 1024px, the image and text now stack so the heading and enquiry link do not feel compressed on tablets.

Validation completed:

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`: 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory. Temporary output and generated `tsconfig.json` changes were removed.
- Browser review at 375px, 768px, and 1440px confirmed no horizontal overflow and the new responsive layout.
- `git diff --check`

### Homepage portfolio mobile gutters

Restored a 1rem horizontal gutter at the phone breakpoint for the Land portfolio content. The image and copy now share an inset instead of sitting flush against the section's content edge. Existing section rules, copy, caption, and desktop/tablet layout remain unchanged.

Validation:

- `npx tsc --noEmit`
- `npm run lint`
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory; temporary output and generated `tsconfig.json` changes were removed.
- Browser measurements at requested widths 375px, 768px, and 1440px found no horizontal overflow. The portfolio image and copy align at 16px on mobile, retain the tablet gutter, and remain two-column at desktop.
- `git diff --check`

## Known issues

- **Resolved:** The preview originally rendered unstyled because the custom Turbopack Tailwind rule matched `.module.css`, leaving route `styles.*` values undefined while emitting plain global selectors. Narrowed the rule to `**/globals.css`, preserving the Tailwind transform for the global stylesheet while allowing native Next/Turbopack CSS Module handling. Verified the dev response has matching scoped class names and CSS selectors, and the production prerender contains module-generated classes.
- A default production build could not unlink `.next/server/app/(public)` while the existing development server was running. A production build using an isolated output directory completed successfully. No persistent build-directory configuration was added.
- Responsive browser screenshot and interaction review of the adopted design at 375px, 768px, and 1440px remain pending. The integrated browser connection previously timed out.
- The first production build attempt failed because `SITE_URL` was unset. Re-running with the documented canonical origin succeeded.