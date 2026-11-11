# Phase 05: Property Detail Implementation Plan

## Goal

Build `/properties/[slug]` as a server-rendered editorial detail page for one real, published property. Show only stored facts, return not-found for unknown or non-public slugs, and let a visitor send a private inquiry associated with the property's UUID.

## Skills and documentation read

- `build-editorial-ui`: reviewed the editorial design, shared component, responsive width, and reference requirements.
- `supabase`: reviewed anonymous server-side reads, RLS visibility, public Storage asset URLs, and the requirement to verify current docs before implementation.
- `write-rhema-copy`: reviewed customer-facing language and content constraints.
- Before implementation, read the current Supabase changelog and docs relevant to public row lookup and Storage asset delivery.
- Before implementation, read the version-matched Next.js 16.4.5 docs for dynamic routes, `generateMetadata`, `notFound`, `io`, Server Components, Suspense streaming, and Image.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase05-property-detail.md`
- `docs/specs/phase04-property-listing.md`
- `docs/specs/phase07-inquiry-forms.md`
- `docs/progress.md`
- `src/app/(public)/properties/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/components/ui/cards.tsx`
- `src/components/ui/status-badge.tsx`
- `src/components/site/inquiry-form.tsx`
- `src/lib/properties/data.ts`
- `src/lib/properties/model.ts`
- `src/lib/properties/images.ts`
- `src/lib/inquiries/actions.ts`
- `src/lib/inquiries/submission.ts`
- `src/lib/inquiries/validation.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/config.ts`
- `supabase/migrations/20261106194113_initial_content_schema.sql`
- `tests/inquiries/submission.test.cjs`
- `tests/properties/data.test.cjs`
- `src/app/globals.css`
- `next.config.ts`
- `package.json`
- `/design/editorial-reference.png`
- `context/ui-registry.md` search: no registry file was found.

## Decisions and sources

- **Slug lookup:** Query by the exact `slug`, explicitly require `is_published = true`, and continue using `createSupabaseServerClient`. RLS remains the visibility boundary. Unknown and unpublished records both return not-found without disclosing whether a private record exists. Source: Phase 05 spec and `properties_public_read` in the Phase 03 migration.
- **Database outcomes:** Keep not-found separate from query/configuration/record-validation errors. Log read failures server-side and render a clear error state for operational failures rather than calling `notFound()` or pretending no record exists. Sources: Phase 05 requirements and the Phase 04 data-access pattern.
- **Property facts:** Reuse the Phase 04 parser and KES formatter. Render stored title and description; omit null plot size, render a null price as `Price on request`, and omit status when null. Do not infer availability. Source: Phase 03 schema, Phase 05 spec, and `AGENTS.md`.
- **Description rendering:** The database stores `description` as text, while the repository has no rich-text serialization/rendering contract. Render the stored string as plain text in React with preserved line breaks. Do not inject HTML or invent a format. Source: Phase 03 schema and the absence of an existing description renderer.
- **Images:** Present stored `{ path, alt }` images in their existing array order. Build public URLs from the existing `property-images` bucket. If the record has no images, show the existing local land illustration with its neutral placeholder alt/label. Source: Phase 03 image shape and Storage policy, Phase 05 spec, and Phase 04 image handling.
- **Inquiry association:** Embed the existing protected `InquiryForm` in a detail-page inquiry section and pass that record's UUID into its hidden `propertyId`. Update the form to accept an optional property ID while preserving the general `/contact` flow. The server action continues checking that the submitted ID belongs to a published record before insertion. Recommendation: use this direct, contextual form rather than an intermediate query-string link, so the property context is explicit and the existing server-side validation remains authoritative. Sources: Phase 05 spec and Phase 07 implementation/spec.
- **Metadata:** Use `generateMetadata` with the actual record title and a restrained description derived only from that record's stored location and description. Return generic properties metadata for absent slugs, without revealing private values. Source: Phase 05 metadata requirement and Phase 03 record fields.
- **Rendering design:** Use an editorial image-led layout with a responsive ordered image gallery, small status/price markers, clear property facts, and a direct inquiry section. Reuse shared typography, card/status patterns, and CSS tokens. Do not add a map, filters, invented promotional claims, or speculative facts.
- **Data freshness and Next.js:** Keep property lookup at request time with `io()` and a Suspense boundary, consistent with the Phase 04 solution for Cache Components and uncached Supabase reads. If metadata and page both request the same slug, use a request-scoped deduplication pattern only if supported by the version-matched Next.js guide.
- **Data activity:** Read-only property lookup only. Do not add or alter listings, run database writes/migrations, or submit another inquiry.

## Files to touch after approval

- `src/app/(public)/properties/[slug]/page.tsx` (new): dynamic detail route, page metadata, not-found and operational error handling, gallery, facts, and associated inquiry section.
- `src/lib/properties/data.ts`: add a public published-property-by-slug lookup using existing data types, parsing, image URL, and error boundaries.
- `src/components/site/inquiry-form.tsx`: accept optional `propertyId`, retaining an empty association on the general contact form.
- `src/app/globals.css`: add token-based responsive detail/gallery/inquiry styles.
- `tests/properties/data.test.cjs`: cover exact slug and publication filters, found, not-found, invalid record, database failure, and image fallback.
- `tests/inquiries/` and `tests/inquiries/run.cjs`: verify optional property ID reaches the form and existing general inquiries remain unassociated; ensure server action validation still rejects unpublished IDs.
- `docs/progress.md`: record Phase 05 status, validation, and known issues after implementation.

## Acceptance criteria

- A published slug renders exactly its database record, fetched on the server through the anonymous client and protected by RLS.
- Unknown, unpublished, or otherwise non-public slugs return the Next.js not-found response and reveal no private record content.
- A query, configuration, or invalid-record failure is logged and distinguishable from not-found.
- Title, description, location, images, size, price, and status reflect stored data only. Null optional values follow the approved display rules.
- Stored images preserve their order and alt descriptions. Empty images use the local placeholder without breaking layout.
- The inquiry form carries the exact property UUID. The existing server action validates publication before writing, and the general contact form retains its existing nullable association.
- Metadata uses only the matching public record's values and does not invent claims.
- Layout works at 375px, 768px, and 1440px and follows `/design/editorial-reference.png` and global design tokens.
- Tests, TypeScript, lint, production build, and browser validation pass.
- No development property is inserted or altered, no migration runs, and no inquiry is submitted.

## Manual test steps

1. Use tests/mocks for a public record with complete fields, a record missing price/size/status/images, an unknown slug, an RLS-hidden record, an invalid record, and a query failure.
2. Verify each lookup filters by the exact slug and `is_published = true`.
3. Verify metadata reflects only stored public property values; verify missing/unpublished values do not appear in metadata.
4. Verify images render in stored order with their stored alt text and that an empty array uses the labeled local illustration.
5. Verify the form submits the matching property UUID to the existing action; verify an empty optional prop preserves the general contact form.
6. Verify published property association passes the existing validation and unpublished or unknown IDs fail before insert. Use mocks only; do not submit a live inquiry.
7. Verify unknown and unpublished slugs produce a 404 and operational read errors are not disguised as 404s or empty states.
8. Review the real `/properties` list and any available detail fixture in a browser at 375px, 768px, and 1440px. Check layout, focus, image alt text, error/empty states, and no horizontal overflow.
9. Run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

## Known issues and dependencies

- **Unresolved:** The development database has no published property records. The actual detail route will therefore return not-found for current slugs until real property data is added.
- The site has not defined a rich-text content format. This phase will safely render the stored description as plain text and preserve line breaks.
- The property inquiry form is configured only when development Turnstile and Supabase secret values are present. No live submission is part of this phase.
- The Phase 04 cards now link to this future route; implementing this phase will make the links resolve for published slugs.
