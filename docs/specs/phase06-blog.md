# Phase 06: Blog

## Status

Implemented. Public journal pages read published Supabase records, sanitize article content, and keep the planned home-page topics only when no articles are published.

## Goal

Build the public journal index and article pages from approved, published blog records.

## Scope

- `/journal` index of published articles.
- `/journal/[slug]` article detail.
- Article title, excerpt, body, cover image, and publication date where present.
- Empty, unavailable, and not-found states.

## Requirements

- Fetch articles on the server and show only records that meet the agreed published-content rule.
- Use the existing `published_at` field as the publication signal only after its nullability and publishing semantics are confirmed in Phase 03.
- Do not fabricate article content, author names, dates, or cover images.
- Render rich text safely. Do not render unsanitized HTML from user-editable content.
- Unknown or unpublished slugs must not reveal content.
- Use editorial layouts and responsive imagery consistent with the design system.
- Replace home-page topic placeholders only when actual approved posts are available.

## Acceptance criteria

- The journal index lists only actual published content and links by slug.
- Article detail displays the stored title, excerpt, body, image, and date without invented metadata.
- Draft or unpublished records are not visible publicly.
- Empty, error, and not-found states are explicit.
- Rich text cannot execute arbitrary markup or scripts.
- TypeScript, lint, build, data tests, and responsive browser checks pass.

## Dependencies

- Phase 02 public layout shell.
- Phase 03 blog schema, RLS, and publishing semantics.
- Phase 10 admin blog publishing flow for editorial management.

## Validation

Completed:

- Added model and data tests for publication cutoffs, storage paths, pagination, missing covers, empty results, query errors, and rich-text sanitization.
- Verified 65 automated tests, TypeScript, lint, and the production build.
- Reviewed the live empty Journal state at 375px, 768px, and 1440px with no horizontal overflow.
- Verified an unknown article slug renders the custom not-found view without exposing article content.

## Known issues

- **Pending live-content verification:** The configured development database has no published journal posts. The populated index, article detail, cover image, and multi-page feed were verified with mocked data rather than live records.
- **Pending editorial management:** Phase 10 admin blog publishing is not implemented yet. No published article content was created as part of this phase.
- **Resolved:** The first production build found `searchParams` outside a Suspense boundary. The Journal route now reads pagination parameters inside the boundary, and the production build passes.
- **Resolved:** The CommonJS test harness did not interoperate with the sanitizer's default import. The code now uses the documented named `filterXSS` export, and the sanitization tests pass.
- **Accepted limitation:** Under Next.js Cache Components, `notFound()` may run after the article shell has streamed, resulting in an HTTP 200 response even though the custom not-found view is shown. As with the property detail route, no unpublished article content is returned.
