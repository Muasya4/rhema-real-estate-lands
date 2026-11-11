# Phase 03: Properties Schema Implementation Plan

## Goal

Define and validate the PostgreSQL schema, migrations, grants, and row-level security for Rhema properties, inquiries, journal posts, and admin roles, with no production data seeded.

## Skills and documentation read

- `supabase`: reviewed migration workflow, security checklist, Data API exposure, CLI discovery requirements, and project setup checks.
- `supabase-postgres-best-practices`: reviewed RLS basics, constraints, data types, foreign-key indexes, and least-privilege grants.
- Supabase changelog: checked current breaking changes. CLI v3 defaults database commands to local and requires explicit confirmation for hosted changes.
- Supabase Row Level Security documentation.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase03-properties-schema.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/product.md`
- `docs/progress.md`
- `package.json`
- App and component file listings
- Supabase and Postgres skill references

At initial inspection, no `supabase/` directory, migrations, SQL schema, Supabase SDK dependency, environment configuration, or Supabase CLI was present. No `.env*` files are configured at the repository root.

## Decisions and sources

The following decisions were confirmed by the user before migration work:

- **Region values:** Use all 11 service-area names from `AGENTS.md` as canonical enum values, represented in SQL as normalized lowercase identifiers: `nairobi_metropolitan_area`, `ruiru`, `kamakis`, `thika_road_corridor`, `kiambu_county`, `machakos`, `kajiado`, `kagio`, `kutus`, `sagana`, and `baricho`. Keep `location` as free text for a more specific locality/address. Do not invent wider region groupings.
- **Property status:** Use exactly `available`, `reserved`, and `sold` from `AGENTS.md`.
- **Missing property status:** The user confirmed that `status` is nullable and has no default, so a missing value cannot imply availability.
- **Price:** Use nullable `bigint` for whole KES shillings. Null means price on request. The user approved this; `AGENTS.md` specifies KES integers and Phase 03 asks for safe numeric capacity.
- **Publication:** Add `is_published boolean not null default false` to properties so drafts are private and publication is explicit. Journal publication is represented by nullable `published_at`; null means draft, a future timestamp means scheduled, and a timestamp at or before now is public. The user approved this behavior.
- **Property images:** Store an ordered JSONB array of `{ path: string, alt: string }` records, where `path` is a relative object path in a public-read Storage bucket, never a URL, secret key, or credential. Validate the exact shape in SQL and at the TypeScript boundary. The user approved this shape and public-read/admin-write policy. Defer size and MIME limits until the admin upload flow is designed.
- **Inquiry spam:** The user approved creating the table with RLS but no public INSERT grant or policy until Phase 07 defines and implements abuse controls. Do not expose a form or direct write UI in this phase.
- **Foreign keys:** `inquiries.property_id` uses `ON DELETE SET NULL` so inquiry history survives property removal. `admin_roles.user_id` uses `ON DELETE CASCADE` when an Auth user is removed.
- **Timestamps:** Use `timestamptz`, database defaults, and an update trigger for mutable records.
- **Content:** Use `text` for rich-text content at the database layer; define the editor/serialization and safe rendering format in the relevant admin/public implementation phases.
- **Indexes:** Unique indexes for property and post slugs; only the property visibility/status/region and inquiry FK access paths needed by the planned queries.
- **Admin roles:** `admin_roles` is not self-service. Authenticated users can read their own role row for authorization checks. Only trusted service-role provisioning can create/revoke admin roles; no user-facing INSERT/UPDATE/DELETE policy.
- **RLS/grants:** Enable RLS on all application tables. Public users may read published properties and published posts only. Admin reads/writes require an `admin_roles` row for `auth.uid()`. No public inquiry reads or inserts in this phase.
- **Database execution:** The user approved repository migration and SQL test files only until a non-production environment is configured. Do not request or commit service-role secrets and do not target a hosted project.

## Recorded answers to Phase 03 decisions

1. Use all 11 supplied service-area names as canonical region values.
2. Use explicit property publication, timestamp-based journal publication, and nullable `bigint` prices.
3. Use ordered `{ path, alt }` image records in a public-read, admin-write Storage bucket. Defer upload size/MIME limits.
4. Do not enable public inquiry inserts until Phase 07 abuse controls are ready.
5. Keep missing property status nullable with no default.
6. Create repository migrations and SQL tests only; database execution remains blocked until a non-production Supabase environment and tooling are available.

## Files changed after approval

- `supabase/migrations/20261106194113_initial_content_schema.sql`: tables, types, constraints, indexes, update trigger, grants, and application-table RLS policies.
- `supabase/tests/database/content_schema_test.sql`: schema, grant, and RLS tests for anon, authenticated non-admin, and admin behavior.
- `src/lib/properties/images.ts`: validate the property image shape at application boundaries without adding a database client or dependency.
- `docs/specs/phase03-properties-schema.md`: record final decisions, schema details, test instructions, and status.
- `docs/progress.md`: record changes, validations, and unresolved local-environment or deployment issues.
- `docs/supabase-test-project.md`: document safe testing on a disposable Supabase project and Dashboard-managed Storage configuration.

## Acceptance criteria

- A clean local database can apply the migration successfully once local Supabase CLI/Docker tooling is configured.
- Schema columns, nullability, constraints, foreign keys, deletion behavior, and indexes match approved decisions.
- RLS is enabled on every application table and is tested for anonymous, authenticated non-admin, and admin roles.
- Anonymous users cannot read or mutate inquiries or grant admin roles.
- Public content reads include only published records; admin mutations require the role table.
- Public inquiry insertion is disabled and remains unavailable to public forms until Phase 07 adds the agreed abuse controls.
- Storage policies are public-read/admin-write and do not expose credentials or permit unauthorized uploads.
- TypeScript, lint, and production build pass if application types are changed.
- No migration is applied to a hosted project without explicit target and user confirmation.

## Manual test steps

1. Start a clean local Supabase stack and apply migrations when CLI and Docker tooling are available.
2. Inspect table, enum, constraint, index, trigger, privilege, and RLS definitions.
3. Run SQL tests under `anon`, authenticated non-admin, and admin identities.
4. Verify anon can read published public content, cannot read drafts or inquiries, cannot mutate content, and cannot grant roles.
5. Verify non-admin cannot mutate records or see other users' roles; verify admin can perform approved content operations.
6. Verify anonymous inquiry inserts remain denied and property deletion preserves inquiry history.
7. Run TypeScript, lint, and production build.
8. Confirm the migration target is local; do not push to hosted until a non-production project is explicitly configured and approved.

## Current execution limitation

The repository still has no `supabase/config.toml`, Supabase CLI, Docker, configured database environment, or Supabase SDK. The migration and SQL tests are present. The migration was applied to a disposable PostgreSQL compatibility harness, but pgTAP execution against Supabase remains unverified until the user configures local tooling or a non-production environment. The verified Supabase CLI v3 guidance defaults DB commands to local and requires explicit confirmation for hosted changes; no hosted database was modified.

The CLI migration command could not be run because the CLI is not installed and the ephemeral npm invocation stalled. The migration filename was generated from the local system clock instead. The migration and test files remain versioned under the standard `supabase/` paths.
