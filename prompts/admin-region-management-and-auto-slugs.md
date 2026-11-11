# Admin Regions and Automatic Slugs

**Status:** Approved and implemented. Local tests and a disposable PostgreSQL 18 migration/RLS verification passed. Supabase pgTAP and hosted-database verification remain pending.

## Goal

Make property slugs generate from the title by default while remaining editable, and replace the fixed region enum and hard-coded public region lists with admin-managed regions. Keep region name changes reflected in property selectors and public pages. Prevent deleting regions that properties still use.

## Skills and documentation read

- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/supabase-postgres-best-practices/SKILL.md`
- `.agents/skills/supabase-postgres-best-practices/references/schema-constraints.md`
- `.agents/skills/supabase-postgres-best-practices/references/security-rls-basics.md`
- `.agents/skills/supabase-postgres-best-practices/references/security-privileges.md`
- `.claude/skills/write-rhema-copy/SKILL.md`
- Next.js 16 local docs: App Router forms and Server Actions.
- Supabase changelog checked. No relevant supabase-js breaking change found; the CLI v3 notice is not applicable because this project does not use a Supabase CLI installation.

## Files and resources inspected

- `AGENTS.md`, `docs/progress.md`, `docs/specs/phase03-properties-schema.md`, `docs/specs/phase09-admin-properties.md`, `docs/specs/phase10-admin-blog.md`
- `src/app/admin/page.tsx`, `src/app/admin/properties/page.tsx`, `src/app/admin/properties/new/page.tsx`, `src/app/admin/properties/[id]/page.tsx`
- `src/app/(public)/page.tsx`, `src/app/(public)/regions/page.tsx`, `src/app/(public)/properties/page.tsx`, `src/app/(public)/properties/[slug]/page.tsx`
- `src/components/admin/properties/property-form.tsx`, `src/components/ui/cards.tsx`
- `src/lib/admin/properties/actions.ts`, `src/lib/admin/properties/data.ts`, `src/lib/admin/properties/validation.ts`
- `src/lib/properties/model.ts`, `src/lib/properties/data.ts`, `src/lib/auth/guard.ts`, `src/lib/supabase/auth-server.ts`
- `supabase/migrations/20261106194113_initial_content_schema.sql`, `supabase/tests/database/content_schema_test.sql`
- `tests/properties/admin-validation.test.cjs`, `tests/properties/admin-actions.test.cjs`, `tests/properties/data.test.cjs`, `tests/inquiries/run.cjs`
- `src/app/globals.css`, Next.js forms and server actions guides, `package.json`

The Supabase CLI was invoked temporarily through npx to generate the migration. Docker and pgTAP are not available in this checkout. Both migrations were applied to a disposable local PostgreSQL 18 database for data-preservation and core RLS checks. No production or staging database was changed.

## Decisions and sources

- **Automatic title slugs:** Add a shared title-to-slug helper. Follow the existing database slug contract, lowercase ASCII letters and numbers separated by single hyphens (`20261106194113_initial_content_schema.sql`). Normalize Unicode marks before removing unsupported characters. New property forms start with a generated slug and update it as the title changes until the admin edits the slug. Explain above the field: “The slug is generated from the title. You can edit it before saving.” Existing property slugs are preserved by default when editing, so title edits do not silently change existing public URLs.
- **Blog slug behavior:** Make the helper reusable and add automatic, editable slug generation to the Phase 10 blog-editor spec. The blog editor itself is not part of this task because it is a separate planned phase and does not exist yet.
- **Managed region model:** Replace the fixed `property_region` enum with a `public.regions` table containing a stable slug, editable display name, and display order. Seed all 11 existing enum values in their current order from Phase 03 and `AGENTS.md`. Convert each property’s existing enum value to its matching region slug before adding a restrictive foreign key. Keep the stable slug when an admin renames a region.
- **Region access:** Enable RLS. Permit anonymous and authenticated public reads of region names and ordering. Permit authenticated writes only when the current user has the `admin` row in `admin_roles`, matching the existing application authorization design. Grant only the table operations needed by those flows.
- **Region deletion:** The user chose to block deletion while any property references the region. Use a database foreign key with `ON DELETE RESTRICT` as the final integrity guarantee and show a useful admin error. Unused regions can be deleted. Do not cascade-delete properties or silently reassign them.
- **Public region lists:** Replace hard-coded lists on `/`, `/regions`, and property selectors with the managed records. Query errors must remain visible instead of silently falling back to an outdated list.
- **Admin workflow:** Add a protected `/admin/regions` page linked from the admin dashboard. Admins can add, rename, and delete regions. New regions are appended after the existing ordered records. Every mutation rechecks the admin role server-side, validates names and generated slugs, handles duplicate names/slugs and referenced-region deletes explicitly, and revalidates the public home, region, and property surfaces.
- **Property editing:** Load region options from the database for new and existing property forms. Validate selected region slugs against database constraints, display current region names in admin records, and retain user-entered values with actionable errors.
- **Data preservation:** Migration maps the existing 11 enum values to seeded stable region slugs and updates properties before replacing the enum-backed column. Existing property IDs, slugs, publication states, and other fields remain unchanged.

## Files to touch

- `supabase/migrations/` for the data-preserving regions table, RLS/grants/policies, property region conversion, unique constraints, and restrictive foreign key.
- `supabase/tests/database/content_schema_test.sql` for seeded region values, public read/admin write rules, migration mapping, and delete restriction.
- `src/lib/regions/` for region model and public/admin data reads.
- `src/lib/admin/regions/` for server-validated create, rename, and delete actions and action state.
- `src/lib/slug.ts` (or an equivalent shared utility) for the title-to-slug rule.
- `src/app/admin/regions/page.tsx` and a client admin region manager component.
- `src/app/admin/page.tsx` for dashboard access to region management.
- `src/components/admin/properties/property-form.tsx` for generated editable slugs and database-provided region options.
- `src/app/admin/properties/new/page.tsx`, `src/app/admin/properties/[id]/page.tsx`, `src/app/admin/properties/page.tsx`, and `src/lib/admin/properties/{actions,data,validation}.ts` for dynamic region selection, validation, and labels.
- `src/lib/properties/{model,data}.ts` and public property pages as needed to resolve current region records safely.
- `src/app/(public)/page.tsx` and `src/app/(public)/regions/page.tsx` for database-driven public region lists.
- `src/app/globals.css` for the region manager and slug help-text layout using existing tokens.
- `tests/regions/`, slug/property test suites, and `tests/inquiries/run.cjs`.
- `docs/specs/phase03-properties-schema.md`, `docs/specs/phase09-admin-properties.md`, `docs/specs/phase10-admin-blog.md`, and `docs/progress.md`.

## Acceptance criteria

- A new property title produces a valid slug immediately; typing continues to update the slug only until the admin edits it.
- The form explains slug generation, permits a preferred manual slug, and leaves existing slugs unchanged on title-only edits.
- The slug helper is reusable, and Phase 10 explicitly requires the blog editor to use it.
- Existing properties retain their associated region after the migration.
- Admins can create, rename, and delete unused regions through protected controls.
- Deleting a region used by properties is blocked both in the UI feedback and by the database constraint; no properties are deleted or reassigned.
- New and renamed regions appear on the property dropdown, home page, and `/regions` without code changes.
- Public callers can read only region data; only verified admins can mutate it.
- Region names/slugs reject blank values and duplicate values; normal Postgres/RLS protections remain in force.
- TypeScript, lint, build, unit tests, and database/RLS tests pass. No hosted database changes are made during local implementation.

## Manual test steps

1. In a local/test database, apply the migration with existing property fixtures and verify every old enum region maps to the matching seeded region.
2. Open a new property form. Type a title, confirm the slug updates, edit the slug, then continue typing and confirm the preferred slug remains.
3. Edit an existing property. Change only its title and confirm its public slug stays unchanged. Select a newly created region and save.
4. As an admin, create a region, rename it, and delete it while unused. Confirm the selector, home page, and `/regions` show each change.
5. Attempt to delete a region used by a property. Confirm the action reports reassignment is needed and the property remains intact.
6. Attempt admin region mutations as a signed-out user and an authenticated non-admin. Confirm both are denied.
7. Test duplicate region names/slugs, invalid labels, missing database configuration, and database failures.
8. Review admin and public views at 375px, 768px, and 1440px.

## Approval gate

The user approved the complete plan, including the rule that deletion is blocked until associated properties are reassigned. Implementation is complete; hosted schema changes remain outside the approved local verification workflow.
