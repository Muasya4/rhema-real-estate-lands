# Phase 10: Admin Blog

## Status

Implemented locally. The protected admin Journal editor and preview are available in the repository. Staging and authenticated browser workflows remain pending.

## Goal

Allow verified administrators to create, edit, preview, publish, and unpublish journal articles.

## Scope

- Protected article list and editor.
- Title, slug, excerpt, rich-text content, cover image, and publication controls.
- Slugs use the shared title-to-slug helper. New article slugs update as the title is typed until the admin edits the slug, with a clear explanation above the field.
- Admin-only preview uses the same content sanitizer as the public article.
- Public index/detail integration with Phase 06.

## Requirements

- Protect pages and every server action with server-side session and admin-role verification.
- Use the Phase 03 schema. Confirm publishing behavior around `published_at` before implementation; do not silently add an unapproved status column.
- Unpublished content is admin-only. Public reads follow the published-content RLS policy.
- Validate title, slug uniqueness, excerpt, body, and image values on the server.
- Sanitize rich text at the public rendering boundary.
- Store cover images using the approved Storage policies and report upload failures explicitly.
- Do not fabricate article content or dates. Admin previews must be clearly separate from public routes.

## Acceptance criteria

- Verified admins can create and edit unpublished articles, preview them, and publish/unpublish according to the agreed schema.
- Public visitors can read only published articles.
- Slugs are unique and unknown or unpublished public routes do not reveal content.
- Rich text and images are safely rendered.
- Public index and detail pages update after publication changes.
- Tests cover authorization, schema validation, publishing transitions, and failed uploads/writes.

## Dependencies

- Phase 03 blog schema, RLS, Storage, and publishing semantics.
- Phase 08 admin authentication.
- Phase 06 public journal pages.

## Validation

Automated coverage includes draft creation, editing, unpublishing, scheduling, duplicate slugs, unauthorized mutations, cover upload/removal, write failures, and the existing public published-only query behavior. The full local test suite, TypeScript, lint, production build, and public Journal responsive width checks passed.

## Known issues

- **Pending staging verification:** No authenticated admin session was available for editor/preview browser review or live upload, publish, schedule, and unpublish checks. Use a non-production Supabase project and follow the manual steps in `prompts/phase10-admin-blog.md`.
- **Accepted Storage limitation:** `property-images` is a public bucket. Draft cover images can be fetched by anyone who knows the object URL, even though draft article text and preview routes are admin-only. Do not upload confidential imagery.
