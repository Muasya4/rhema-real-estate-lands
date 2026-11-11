# Phase 04: Property Listing Implementation Plan

## Goal

Turn `/properties` into a server-rendered, finite editorial portfolio of real published property records. Keep the existing empty state when there are no public records, distinguish read failures from an empty portfolio, and link each record to its future `/properties/[slug]` detail route.

## Skills read

- `build-editorial-ui`: reviewed the editorial UI rules, shared design-system expectations, responsive widths, and visual reference requirements.
- `supabase`: reviewed public server-side access, RLS visibility, Storage image delivery, and current Supabase guidance. The changelog had no relevant breaking changes for the installed `supabase-js` version.
- `write-rhema-copy`: reviewed customer-facing voice and content constraints.
- Next.js 16.4.5 local docs: read the App Router image, image configuration, data fetching, and caching guides. Uncached database reads need to sit behind a Suspense boundary with Cache Components enabled.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase04-property-listing.md`
- `prompts/phase03-properties-schema.md`
- `docs/progress.md`
- `src/app/(public)/properties/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/globals.css`
- `src/components/ui/cards.tsx`
- `src/components/ui/status-badge.tsx`
- `src/app/design-system/page.tsx`
- `src/lib/properties/images.ts`
- `src/lib/supabase/config.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/service.ts`
- `src/lib/inquiries/actions.ts`
- `supabase/migrations/20261106194113_initial_content_schema.sql`
- `public/land-placeholder.svg`
- `next.config.ts`
- `package.json`
- `tests/inquiries/run.cjs` and existing inquiry test patterns
- `/design/editorial-reference.png`
- `context/ui-registry.md` search: no registry file was found.

## Decisions and sources

- **Visibility:** Fetch on the server with `createSupabaseServerClient`, never the service-role client. Query published records and rely on the public RLS policy as the database visibility boundary. Source: Phase 04 spec and `properties_public_read` in the Phase 03 migration.
- **Records and order:** Render all public records in one finite page, with featured records first and then newest `created_at` first. Do not add infinite scrolling or a made-up page-size cap. The ordering uses the existing `featured` and `created_at` fields from the schema. Revisit only if the real portfolio requires a different editorial order.
- **Region filtering:** Do not add a filter in this phase. Filtering is optional in the Phase 04 spec; the curated portfolio should stay simple until real records demonstrate a clear need and a usable mobile control.
- **Fields:** Use values stored on each property. Show the recorded `location`; omit missing `plot_size`; show `Price on request` for a null `price_kes`; display a status marker only when status is present. A missing status must never imply availability. Sources: Phase 03 schema and `AGENTS.md`.
- **Images:** Use the first validated `{ path, alt }` image from the existing `images` helper and the public `property-images` bucket. Use `public/land-placeholder.svg` only when there is no image. Do not invent imagery, alt text, or listing content. Sources: Phase 03 image shape and bucket policy, Phase 04 spec, and existing local placeholder.
- **Cards:** Adapt the existing `PropertyCard` pattern so real records can supply their image, optional size/status, price, location, and slug link; update its design-system specimen at the same time. Preserve shared status badge styling and use global design tokens rather than hard-coded colors.
- **Data failures:** Keep the no-records state distinct from query or record-validation failures. Report read failures server-side with non-sensitive error details and render a clear error state; never silently convert a failed read into an empty result.
- **Database activity:** This phase is read-only. Do not insert or edit property data, apply migrations, or submit another inquiry. The accepted inquiry test is complete.
- **Phase sequencing:** Cards target `/properties/[slug]`; that route is Phase 05 and is not in this phase's implementation scope. Continue to Phase 05 promptly so links resolve to the detail pages.

## Files changed during approved implementation

- `src/app/(public)/properties/page.tsx`: replace the placeholder-only route with server-fetched published records and explicit empty/error states.
- `src/lib/properties/data.ts`: perform the RLS-protected public query, resolve the first stored image, and distinguish empty, invalid, and failed reads.
- `src/lib/properties/model.ts`: validate record values and format whole-KES prices.
- `src/components/ui/cards.tsx`: support actual listing data while preserving the shared card component.
- `src/components/ui/status-badge.tsx`: use the canonical property status type.
- `src/app/design-system/page.tsx`: keep the property card specimen aligned with any updated props.
- `src/app/globals.css`: style actual card imagery and listing layout using existing tokens; include responsive rules.
- `next.config.ts`: scope Next Image remote access to the configured project host and public property-image path.
- `tests/properties/` and `tests/inquiries/run.cjs`: cover formatting, missing optional fields, image fallback, canonical statuses, query outcomes, and failures.
- `docs/progress.md`: record Phase 04 completion, validation, and any unresolved issues after implementation.

## Acceptance criteria and outcome

- **Passed:** `/properties` reads public published records using the publishable/anonymous server client, with explicit publication filtering and featured/newest ordering. RLS remains the visibility boundary.
- **Passed:** Cards use stored values, link to `/properties/[slug]`, omit null size/status, show `Price on request` for null price, and visibly identify the local illustration fallback.
- **Passed:** Empty query results and data/query errors return distinct states. Pure parser and mocked data-access tests cover valid, incomplete, empty, invalid, and request-failure cases.
- **Passed:** The route uses the editorial tokens and a Suspense boundary for uncached server data. Browser review of the real empty state passed at 375px, 768px, and 1440px; the card specimen was also reviewed at mobile and desktop widths.
- **Passed:** `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
- **Confirmed:** No inquiry was submitted and no database write or migration was performed.

## Manual test outcomes

1. Mocked tests cover all canonical statuses, null status, null price and size, stored and missing images, empty results, database errors, invalid records, and network failure.
2. The browser showed the actual database-backed empty state, with no records fabricated or submitted.
3. `/properties` was screenshot-reviewed at 375px, 768px, and 1440px. The design-system property card specimen was reviewed at mobile and desktop widths.
4. The focused property tests, TypeScript check, lint, and production build passed.
5. No second inquiry or any database write was performed.

## Known issues and dependencies

- **Unresolved:** The previously verified anonymous development-database read returned zero properties. The empty state is therefore the expected live result until genuine property details are added.
- The Phase 05 property detail route does not exist yet; Phase 04 links will resolve once that phase is implemented.
- `context/ui-registry.md` is absent, so the existing card and badge components are the available reusable UI patterns.
- Browser automation has timed out in prior work. If it recurs, report it and use an available browser/manual review path rather than claiming screenshot verification.
- **Resolved:** With Cache Components enabled, Supabase converted Next.js prerender cancellation into a query error even though the read was inside Suspense. Adding Next.js `io()` before the database request excluded it from prerendering; the final production build completed cleanly.
