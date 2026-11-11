# Phase 10: Admin Journal Editor

## Goal

Let verified Rhema administrators create, edit, preview, schedule, publish, and unpublish journal articles using the existing `blog_posts` schema and public Journal pages.

## Skills read

- `build-editorial-ui`: reuse the existing editorial/admin patterns, design tokens, and responsive checks.
- `supabase`: keep authorization in server-side admin checks and existing RLS; use the authenticated server client for all admin reads and writes.
- `write-rhema-copy`: keep interface text plain, specific, and free of generic property-marketing copy.
- Next.js 16 local docs: `01-app/01-getting-started/07-mutating-data.md`, `08-caching.md`, and `09-revalidating.md`.

## Files and resources inspected

- Instructions and scope: `AGENTS.md`, `docs/specs/phase10-admin-blog.md`, `docs/progress.md`.
- Existing schema and policy semantics: `supabase/migrations/20261106194113_initial_content_schema.sql`.
- Public Journal: `src/lib/journal/data.ts`, `src/lib/journal/model.ts`, `src/app/(public)/journal/[slug]/page.tsx`, and `src/components/journal/journal-card.tsx`.
- Admin patterns: `src/lib/admin/properties/actions.ts`, `src/lib/admin/properties/data.ts`, `src/lib/admin/properties/validation.ts`, `src/components/admin/properties/property-form.tsx`, `src/app/admin/properties/page.tsx`, `src/app/admin/page.tsx`, `src/lib/auth/guard.ts`, and `src/lib/supabase/auth-server.ts`.
- Shared slug helper: `src/lib/slug.ts`.
- Storage and image limits: `docs/supabase-test-project.md`, `next.config.ts`, and property image validation.
- Existing Journal tests: `tests/journal/model.test.cjs` and `tests/journal/data.test.cjs`.
- No `context/ui-registry.md` or existing admin Journal editor was found. Reuse the established admin form/list patterns rather than introduce a new UI library.

## Decisions and sources

1. **Keep the existing schema.** Use `blog_posts` fields `title`, `slug`, `excerpt`, `content`, `cover_image`, and `published_at`; do not add a status column or migration. The existing RLS policy allows public reads only when `published_at` is non-null and no later than `now()`. Source: Phase 03 migration and Phase 10 spec.
2. **Publication states map to timestamps.** Draft/unpublish stores `published_at = null`; publish now stores the current timestamp (preserving an existing past publication timestamp on ordinary edits); schedule stores the administrator-selected future timestamp. Source: existing public query and RLS policy.
3. **Use the shared generated slug behavior.** New article slugs follow the title through `slugify` until manually edited. Validate the format on the server and translate the database unique constraint into a clear duplicate-slug error. Source: `src/lib/slug.ts`, property slug editor, and the schema's unique slug constraint.
4. **Protect draft data and preview routes.** Require `requireAdmin()` on each admin page, preview page, and Server Action. Read through the authenticated Supabase client, rely on existing admin RLS as the database boundary, and render preview content only after applying the existing sanitizer. Do not expose a preview through `/journal/[slug]`.
5. **Use the existing image bucket.** Store optional covers under `journal/<post-id>/<random-id>.<ext>` in `property-images`, using the existing 5 MiB, JPEG/PNG/WebP validation and approved admin-only Storage policies. This bucket is public by URL, so its images are not private even when the article text is a draft. Do not upload confidential imagery. Remove a replaced cover only after the post update succeeds; surface failed upload, save, and cleanup operations explicitly. Source: `docs/supabase-test-project.md`, existing property upload flow, and `next.config.ts`.
6. **Approved rich-text authoring.** Use an accessible supported-markup input and an admin-only preview of the saved article, limited to tags already allowed by `sanitizeJournalContent`. This avoids a new editor dependency and keeps the rendered public/preview output aligned with existing sanitization. The user approved this approach.
7. **Revalidate public routes after successful changes.** Revalidate `/journal`, the article route pattern, and old/new article slugs after create, edit, publish, or unpublish. Source: Next.js 16 local `revalidatePath` guidance and the existing public Journal routes.
8. **Do not create sample article content or dates.** Empty states and previews use only values entered by an administrator. Source: Phase 10 spec and Rhema content rules.
9. **Bound article text size.** Limit combined text fields to 500 KiB so a maximum 5 MiB cover and form overhead stay below the existing 6 MiB Server Action request limit. Source: `next.config.ts` and the existing bucket/file ceiling.

## Files to touch after approval

- `src/app/admin/page.tsx`: add navigation to Journal management.
- `src/app/admin/journal/page.tsx`, `src/app/admin/journal/new/page.tsx`, `src/app/admin/journal/[id]/page.tsx`, and `src/app/admin/journal/[id]/preview/page.tsx`: protected list, create/edit, and clearly labeled admin-only preview.
- `src/components/admin/journal/`: article form and the agreed rich-text authoring/preview control.
- `src/lib/admin/journal/actions.ts`, `data.ts`, `validation.ts`, and `state.ts`: authenticated reads, server validation, Storage lifecycle, explicit failures, and publication mutations.
- `src/lib/storage/image-validation.ts` and `src/lib/admin/properties/validation.ts`: share the existing image signature/type/size checks between property and Journal uploads.
- `src/lib/journal/model.ts`: add only the admin-side parsing/validation helpers needed by the editor; keep public sanitization at render boundaries.
- `src/app/globals.css`: responsive styles using existing design tokens.
- `tests/journal/`: validation, admin data, action authorization/write/upload failures, publication transitions, slug collisions, and sanitizer/preview coverage.
- `tests/inquiries/run.cjs`: register the Journal admin test suites in the existing test runner.
- `docs/specs/phase10-admin-blog.md` and `docs/progress.md`: record delivered scope, validation, and any staging/manual checks still needed.

No schema migration or new dependency is planned.

## Acceptance criteria

- An unauthenticated user and a signed-in non-admin cannot view the article list, editor, preview, or invoke a mutation.
- An administrator can create a draft, edit it, preview its sanitized content, publish immediately, schedule a future publication, and unpublish it.
- New slugs track the title until manually edited; duplicate slugs return an actionable error without losing the form values.
- Optional cover upload/removal follows the existing bucket limits and admin Storage policy. Failed upload/save/cleanup is reported without silent success.
- Public index/detail pages continue to read only published, non-future posts; unknown and unpublished slugs remain indistinguishable as not found.
- Mutations revalidate affected public Journal routes.
- No fabricated Journal article or publication date is introduced.
- Tests, TypeScript, lint, production build, and responsive review pass.

## Validation and manual test steps

1. Run targeted Journal and admin action tests, then `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
2. Review the public Journal and new admin layout at 375px, 768px, and 1440px.
3. Without an admin session, request each admin route and invoke an action directly; confirm access is denied or redirected and no record changes.
4. In a non-production project with an admin account, create a draft, preview it, edit its slug, attempt a duplicate slug, add/replace/remove a cover, publish, schedule, and unpublish.
5. After each publication transition, verify the public index and direct article route, including that an unpublished slug returns not found.
6. If staging credentials or dashboard setup are unavailable, record those manual checks as pending instead of claiming they passed.

## Approved approach

Use the approved supported-markup editor and sanitized saved-article preview. No visual formatting toolbar or new editor dependency is included.
