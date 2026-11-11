# Phase 09: Admin Properties Implementation Plan

## Goal

Allow verified administrators to create, inspect, edit, publish, and manage property records and their ordered public images, while preserving the Phase 03 schema and public visibility rules.

## Skills and documentation read

- `supabase` skill.
- Supabase Changelog: no listed breaking change for the installed `supabase-js` package that changes the planned Storage upload flow.
- Supabase Standard Uploads documentation: standard uploads are intended for files no larger than 6 MB.
- Read the Next.js 16 guides from `node_modules/next/dist/docs/` for Server Actions, forms, Cache Components, Server Action body-size limits, and `revalidatePath`.
- Read current Supabase Storage access-control documentation.
- No PostgreSQL schema change is planned. Use the existing authenticated user session and database/Storage RLS; do not use the service-role client for admin mutations.

## Files inspected

- `AGENTS.md`
- `docs/progress.md`
- `docs/specs/phase09-admin-properties.md`
- `docs/specs/phase04-property-listing.md`
- `docs/specs/phase05-property-detail.md`
- `docs/supabase-test-project.md`
- `src/app/admin/page.tsx`
- `src/app/(public)/properties/[slug]/page.tsx`
- `src/app/globals.css`
- `src/lib/auth/guard.ts`
- `src/lib/supabase/auth-server.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/service.ts`
- `src/lib/properties/data.ts`
- `src/lib/properties/model.ts`
- `src/lib/properties/images.ts`
- `src/lib/inquiries/actions.ts`
- `next.config.ts`
- `supabase/migrations/20261106194113_initial_content_schema.sql`
- `package.json`

## Decisions and sources

- Keep all mutations under `requireAdmin()` and use the cookie-bound authenticated Supabase client. The Phase 08 guard verifies both the Auth user and `admin_roles`; the Phase 03 policies authorize the same role for property and Storage mutations.
- Use only the existing `properties` columns. The schema requires title, slug, description, location, and region; price and plot size are nullable; status may be null; `featured` defaults false; and `is_published` defaults false. Source: Phase 03 migration and `src/lib/properties/model.ts`.
- Use the 11 canonical region enum values from the migration, with display labels from `AGENTS.md`. Do not add or infer regions.
- Treat price as a nullable, non-negative whole KES value and reject values outside JavaScript's safe-integer range, matching the public model parser. Blank price and plot size map to `null`.
- Preserve the distinct `available`, `reserved`, and `sold` values, with an explicit unset choice because status is nullable. Source: `src/lib/properties/model.ts` and the Phase 03 enum.
- Expose publication as an explicit control; new properties remain unpublished unless the administrator publishes them. Source: schema default and public query filters in `src/lib/properties/data.ts`.
- Keep descriptions as plain text in a multiline field. The public detail page renders descriptions as React text, which escapes markup; do not introduce arbitrary HTML until an approved rich-text format and sanitizer are selected.
- Approved upload bounds: 5 MiB per image; JPEG, PNG, and WebP only. Supabase recommends standard uploads for files up to 6 MB; the narrower bound and format allowlist were approved for this implementation.
- Accept one new image per save so the server can validate and associate each upload as one transaction. Set the Next.js Server Action body limit to 6 MB to accommodate the approved 5 MiB image plus multipart overhead; the action also enforces the per-image cap and signature checks.
- Generate opaque storage object names rather than using client filenames. Persist ordered `{ path, alt }` records as required by the database and `src/lib/properties/images.ts`. Upload new objects before updating references; clean up new uploads if persistence fails, and remove old objects only after the database no longer references them.
- Do not add property deletion or new database schema. Neither is included in the Phase 09 scope.

## Files to touch

- `src/app/admin/page.tsx`: replace the placeholder with links to property management.
- `src/app/admin/properties/page.tsx`: protected property list, including draft/published state and edit links.
- `src/app/admin/properties/new/page.tsx`: protected create view.
- `src/app/admin/properties/[id]/page.tsx`: protected edit view.
- `next.config.ts`: set the Server Action request limit to 6 MB to accept the approved image bound plus multipart overhead.
- `src/components/admin/properties/`: property form and ordered image-management controls.
- `src/lib/admin/properties/`: server actions, server-side validation, and mutation/data helpers.
- `src/app/globals.css`: responsive admin-property and image-management styles using existing design tokens.
- `tests/properties/` and `tests/inquiries/run.cjs`: focused validation, authorization-boundary, mutation, and failure-path tests integrated with the existing runner.
- `docs/progress.md`, `docs/specs/phase09-admin-properties.md`, and `docs/supabase-test-project.md`: record implementation status, validation, and required hosted Storage settings.

No dependencies or database migrations were required.

## Acceptance criteria

- Verified admins can list properties and create or edit every supported schema field, including publication, featured status, nullable facts, and status.
- Every protected page and mutation performs server-side role verification; database and Storage writes use the authenticated session and remain subject to RLS.
- Invalid values return field-specific errors without losing entered form data. Duplicate slugs are reported clearly.
- Uploads enforce the approved size and MIME constraints server-side, use safe opaque paths, retain alt text and order, and do not leave broken references on failed saves.
- Removal and replacement update the database before deleting unreferenced objects; partial Storage failures are reported explicitly.
- Public listing and detail routes reflect saved publication and content changes using the established rendering behavior.
- Tests cover validation, unauthorized requests, duplicate slugs, save/upload failures, image ordering and removal, and cleanup behavior.
- TypeScript, lint, test suite, and production build pass; browser review covers desktop and mobile admin workflows and public-page updates.

## Manual test steps

1. Sign in as a provisioned admin, open `/admin/properties`, create an unpublished property with nullable price/size/status, then confirm it does not appear publicly.
2. Edit the record, enter all canonical property fields, add images one at a time with alt text, reorder and remove images, and save. Confirm the editor reflects the persisted order.
3. Attempt a duplicate slug, blank required fields, malformed slug, negative/fractional/unsafe price, unsupported image type, and an oversized image. Confirm field-specific errors and retained input.
4. Publish the property and confirm it appears on `/properties` and `/properties/[slug]` with matching facts and image order. Unpublish it and confirm public reads no longer expose it.
5. Exercise failed database writes, failed uploads, and failed Storage cleanup; confirm explicit messages and no broken public image references.
6. Open each admin route and invoke each mutation as a signed-out user and as an authenticated non-admin; confirm access is denied.
7. Review keyboard operation and responsive layouts at 375px, 768px, and 1440px.
