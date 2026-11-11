# Phase 03: Properties Schema

## Status

Implemented in a versioned SQL migration with pgTAP coverage. Migration application and pgTAP execution against Supabase remain pending because the Supabase CLI and Docker are not available in this checkout.

## Goal

Implement and document the database model and Row Level Security policies for properties, inquiries, blog posts, and admin roles.

## Scope

Create migrations for the project entities and their relationships:

- `properties`: `id`, `title`, unique `slug`, rich-text `description`, `location`, `region`, `price_kes`, `plot_size`, `status`, `featured`, `images`, `created_at`, and `updated_at`.
- `regions`: stable slug, display name, display order, and timestamps.
- `inquiries`: `id`, `name`, `email`, `phone`, `message`, nullable `property_id`, and `created_at`.
- `blog_posts`: `id`, `title`, unique `slug`, `excerpt`, rich-text `content`, `cover_image`, `published_at`, `created_at`, and `updated_at`.
- `admin_roles`: `user_id` linked to `auth.users` and `role`.

## Requirements

- Use the field names, relationships, and status values from `AGENTS.md`. Document any migration-level type, nullability, check constraint, index, or deletion behavior before applying it.
- Seed the original 11 supported service areas in `regions`. `properties.region` references the stable region slug; `location` remains available for the more specific place name.
- Public callers may read region names and order. Region inserts, updates, and deletes require a verified admin.
- A region referenced by a property cannot be deleted. Reassign all properties first.
- Choose numeric capacity for `price_kes` that safely stores KES amounts; confirm nullable/unknown-price behavior before migration.
- Define the `images` JSON shape and validate it at application boundaries. Do not store credentials or private image keys in public rows.
- Enable RLS on every application table.
- Public visitors may read only content intended for publication. Admin writes require verified admin authorization.
- Public inquiry submissions must not grant public read, update, or delete access to inquiry records.
- Admin-role grants must not be self-service. Provision and revoke roles through a trusted administrative process.
- Use timestamp handling consistently and keep update timestamps correct for mutable records.
- Add indexes for actual query paths, including unique slugs and relevant public listing filters. Avoid speculative indexes without query evidence.

## Implemented schema decisions

- The initial migration used the 11 canonical region enum values from `AGENTS.md`. The admin-managed-regions migration converts them to stable hyphenated slugs in `public.regions`, updates every existing property reference, and replaces the enum with a text foreign key. Region names can be edited without changing their stable slugs.
- `property_status` contains `available`, `reserved`, and `sold`. Property status is nullable with no default so an unset value does not imply availability.
- Property price is nullable `bigint` whole KES. Null means price on request. Plot size is nullable text.
- Properties default to unpublished. Public readers can select only rows with `is_published = true`; admins can select and mutate all property rows.
- Blog posts use nullable `published_at`: null is draft, a future timestamp is scheduled, and timestamps at or before now are public.
- Property `images` is an ordered JSONB array of exact `{ "path": string, "alt": string }` objects. The database constraint and `parsePropertyImages` reject non-arrays, missing/blank keys, non-string values, extra keys, and absolute URLs instead of relative Storage object paths.
- The `property-images` Storage bucket and its admin-only object policies are configured in the Supabase Dashboard, not by altering Supabase-managed Storage tables in the schema migration. The bucket is public-read by URL; object listing and writes are limited to admins. Upload size and MIME limits are deferred until the admin upload flow is designed.
- `inquiries.property_id` uses `ON DELETE SET NULL`; deleting a property preserves the inquiry. Deleting an Auth user removes its `admin_roles` row with `ON DELETE CASCADE`.
- Inquiry table records are readable/writable only by admins. Anonymous inquiry insertion remains disabled until Phase 07 implements the agreed abuse controls.
- Admin-role rows are readable only by the associated authenticated user. Authenticated users cannot insert, update, or delete role grants.
- `created_at` and `updated_at` use timezone-aware timestamps. A trigger maintains `updated_at` for properties and blog posts.
- Added indexes support public region/date property listings, published article date ordering, unique slugs, and inquiry-to-property access.
- The migration explicitly sets application-table grants in addition to RLS. The service role remains privileged and must not be exposed in a client.

Migrations: `supabase/migrations/20261106194113_initial_content_schema.sql` and the subsequent admin-managed-regions migration.

Database tests: `supabase/tests/database/content_schema_test.sql`. Storage policy and bucket setup must be completed in the Dashboard before running this suite.

Temporary project guide: `docs/supabase-test-project.md`

Application boundary validator: `src/lib/properties/images.ts`

## Acceptance criteria

- Versioned migrations reproduce the schema from a clean database.
- Foreign keys, unique constraints, checks, and indexes match documented decisions.
- RLS is enabled and has tests for anonymous, authenticated non-admin, and admin access.
- No unauthenticated user can read private inquiries, grant admin privileges, or mutate published content.
- Migration and RLS tests pass before public data routes depend on the schema.

## Dependencies

- The repository migration and pgTAP suite are present.
- Apply and run them against a configured local or non-production Supabase environment before data-backed public routes rely on this schema.
- Upload limits/MIME types and public inquiry abuse controls remain intentionally deferred to the admin upload and inquiry phases.

## Validation

Use the Supabase/Postgres skills before writing migrations or policies. Apply migrations to a non-production environment, run schema and RLS tests, and verify representative public and admin queries.

The application schema migration was applied to a disposable local PostgreSQL 18 instance with minimal Supabase-compatible `auth.uid()` and `auth.users` objects. Manual role checks passed for anonymous, authenticated non-admin, and admin access. A non-admin property insert was rejected by RLS, and grants prevented anonymous inquiry access/insertion and authenticated self-granting of admin roles. The temporary database was stopped and removed. Storage setup was subsequently moved out of the migration to the Dashboard, so it remains to be verified on Supabase.

The first hosted SQL Editor attempt stopped with `42501: must be owner of table objects`. The application tables were confirmed absent. The migration no longer changes Storage-managed tables; create the bucket and policies through the Dashboard using `docs/supabase-test-project.md`. The Supabase pgTAP test file was authored but has not been run because the Supabase CLI and Docker are not installed. No production database was configured or modified.

## Known issues

- **Verified locally:** The managed-region migration applied successfully to a disposable PostgreSQL 18 compatibility database with existing properties for all 11 enum values. Their region references were preserved. Anonymous and non-admin reads, non-admin write denial, admin region CRUD, and referenced-region delete restriction passed.
- **Pending:** The expanded pgTAP suite still requires a Supabase-compatible run. No hosted database has been changed.
