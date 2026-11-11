# Phase 09: Admin Properties

## Status

Implemented. Protected property listing, create/edit forms, status and publication management, and ordered Storage image management are in place. Local tests, type checking, lint, and production build pass. Live authenticated Supabase writes and Storage-policy verification remain pending in a configured staging project.

## Goal

Allow verified administrators to manage property records and their public images.

## Scope

- Protected property list and create/edit views.
- Property fields and status management from the approved Phase 03 schema.
- Editable slugs generated from the title by default on new properties. Existing slugs remain unchanged when an editor changes only the title.
- Property region choices loaded from admin-managed regions.
- Protected region management to add, rename, and delete regions that are not assigned to properties.
- Image upload, replacement, ordering, and removal through Supabase Storage.
- Validation and explicit mutation feedback.

## Requirements

- Protect every page and server action using Phase 08 server-side session and role verification.
- Validate all property inputs on the server. Enforce unique slugs and schema constraints.
- New property slugs update as the title is typed until the admin edits the slug. Explain this behavior above the slug field.
- Load region labels from the database, not a hard-coded list. The database restricts deletion of a region while properties reference it.
- Do not invent missing price, size, location, or other property facts. Admins must enter or leave fields empty according to schema rules.
- Public image reads and admin-only image writes must follow the agreed Storage policies.
- Validate image type and size, generate safe storage paths, and remove orphaned uploads where appropriate.
- Sanitize rich-text descriptions before public rendering.
- Report database and Storage failures clearly without leaking credentials or success-shaped fallbacks.
- Preserve the distinct available, reserved, and sold statuses defined by the project.

## Acceptance criteria

- Admins can create, edit, and change status on property records.
- Admins can add and rename regions; new or renamed regions appear on the property form and public location lists. Regions in use cannot be deleted.
- New property titles generate editable slugs without changing existing slugs on title-only edits.
- Non-admins cannot view protected records or execute mutations.
- Validation errors identify fields without losing entered form data.
- Image operations obey Storage access rules and do not leave broken public references.
- Public listing and detail pages reflect saved changes after the configured revalidation behavior.
- Tests cover role checks, validation, uniqueness, image access, and mutation failures.

## Dependencies

- Phase 03 property schema, RLS, and Storage policy decisions.
- Phase 08 admin authentication.
- Phases 04 and 05 public property pages for end-to-end verification.

## Validation

Test create, edit, duplicate slug, invalid data, status changes, image upload/removal, Storage failures, unauthorized access, and public page updates.

## Known issues

- **Pending staging verification:** Local automated checks pass, and the production browser confirmed the signed-out redirect. Live property writes, image operations, Storage bucket limits and admin policies, non-admin denial, and public visibility transitions still require a configured non-production Supabase project and authenticated test accounts.
- **Pending Supabase test run:** The migration and core RLS behavior passed in a disposable local PostgreSQL 18 database. Run the expanded pgTAP suite in a Supabase-compatible environment before staging use.
- **Unresolved development setup:** The configured development database does not yet have the `regions` table. The public region page therefore shows an explicit read-error state until the new migration is applied.
