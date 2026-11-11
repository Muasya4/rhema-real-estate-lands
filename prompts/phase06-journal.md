# Phase 06: Public Journal Implementation Plan

## Goal

Build the public journal index and article pages from published Supabase records, and replace the homepage's planned-topic cards only when published articles exist.

## Skills and documentation read

- `.agents/skills/supabase/SKILL.md`
- `.claude/skills/build-editorial-ui/SKILL.md`
- `.claude/skills/write-rhema-copy/SKILL.md`
- `node_modules/next/dist/docs/` guides for Server Components, request-time data with Cache Components, and metadata
- Supabase JavaScript select and Storage documentation

Before implementation, recheck the installed Next.js guides and the sanitizer's official documentation for the exact APIs in the installed versions.

## Files and resources inspected

- `AGENTS.md`, `docs/specs/phase06-blog.md`, `docs/specs/phase10-admin-blog.md`, `docs/progress.md`
- `docs/product.md`, `src/app/(public)/journal/page.tsx`, `src/app/(public)/page.tsx`
- `src/app/(public)/properties/[slug]/page.tsx`, `src/lib/properties/data.ts`
- `src/components/ui/cards.tsx`, `src/app/globals.css`, `src/app/design-system/page.tsx`
- `supabase/migrations/20261106194113_initial_content_schema.sql`
- `supabase/tests/database/content_schema_test.sql`, `tests/properties/data.test.cjs`
- `package.json`
- `/design/editorial-reference.png`

`BlogCard` is currently a design-system specimen, not a data-backed public article component. No `context/ui-registry.md` was present.

## Decisions and sources

- **Published visibility:** Query only `published_at` values at or before the current time, ordered newest first. The Phase 03 migration and database test establish that null dates are drafts and future dates are scheduled. Public RLS remains the security boundary; no schema or policy changes are planned.
- **Article body:** Sanitize stored rich-text HTML on the server with an explicit allowlist suitable for editorial prose (paragraphs, headings, lists, emphasis, and safe links). Never render the stored value directly. Phase 06 requires safe rich-text rendering, and Phase 10 requires a rich-text editor and the same public rendering boundary. Add a maintained sanitizer dependency only if none is already available; verify its API and URL handling against its official documentation.
- **Cover images:** Treat `cover_image` as a storage path, not an arbitrary remote URL, and resolve it through the existing public `property-images` bucket. This reuses the already approved public-read/admin-write bucket and Phase 10's requirement to use approved Storage policies. Missing cover images remain omitted rather than replaced with invented imagery.
- **Index size:** Show 12 published articles per page, newest first, with ordinary URL-based pagination rather than infinite scroll. This is a proposed page size, not a database value; it keeps the journal readable and bounded while preserving access to older articles.
- **Homepage:** Show up to the three newest published articles in the existing journal section. Keep the current clearly labeled planned-topic cards when there are no published records. The Phase 06 requirement explicitly forbids replacing those placeholders before actual posts exist.
- **Article metadata:** Use only stored title, excerpt, and publication date. Do not invent author names or dates. Unknown and unpublished slugs share a not-found response.
- **Data access and failures:** Follow the server-only Supabase and explicit-result patterns in `src/lib/properties/data.ts`; expose distinct success, empty/not-found, and query-error outcomes so pages can render honest states.
- **Design and copy:** Use `globals.css` tokens and the editorial reference. Keep existing planned-topic copy unchanged; write only the minimum factual labels and state copy needed for the new routes.

## Files to touch

- `src/lib/journal/model.ts` and `src/lib/journal/data.ts` for typed article parsing, safe cover-image URL resolution, and public queries.
- `src/app/(public)/journal/page.tsx`, `src/app/(public)/journal/[slug]/page.tsx`, and `src/app/(public)/journal/[slug]/not-found.tsx` for index, pagination, metadata, detail, and explicit states.
- `src/app/(public)/page.tsx` to show published article previews when available while preserving the no-post state.
- `src/components/journal/journal-card.tsx` and `src/components/journal/home-journal.tsx` for shared article previews and the conditional home section.
- `src/app/globals.css` for responsive editorial journal and article styles using existing tokens.
- `tests/journal/` and `tests/inquiries/run.cjs` for parsing, publication filtering, pagination, missing-image, not-found, and error behavior.
- `package.json` and the lockfile only if a sanitizer dependency is needed.
- `docs/progress.md` and `docs/specs/phase06-blog.md` to record completion and any verified limitations.

## Acceptance criteria

- `/journal` lists only published, non-future posts, newest first, with 12 posts per page and working URL-based pagination.
- `/journal/[slug]` displays stored title, excerpt, sanitized body, optional cover image, and publication date.
- Draft, scheduled, and unknown slugs do not reveal content.
- Empty results, query errors, and not-found routes are visibly distinct.
- No placeholder article or invented metadata is presented as published content.
- The homepage retains its planned-topic cards when there are no articles and uses actual published article links when available.
- TypeScript, lint, build, data tests, and responsive browser checks pass.

## Manual test steps

1. With no published posts, open `/journal` and confirm the explicit empty state. Open the homepage and confirm the planned-topic cards remain clearly labeled as planned.
2. With mock data for a published post, a draft, a future-scheduled post, and a post without a cover image, confirm only the published post appears, its cover is omitted, and the homepage links to it.
3. Open a published slug and confirm the stored metadata and article body render. Verify script tags, event handlers, and unsafe link schemes are removed or rendered inert.
4. Open draft, scheduled, and unknown slugs and confirm none reveal article content.
5. Simulate a Supabase query error and confirm the error state is visible rather than an empty success state.
6. With more than 12 published posts, confirm page navigation preserves newest-first ordering and does not expose unpublished records.
7. Review `/journal`, an article, and the homepage at narrow mobile, tablet, and desktop widths.

## Approval gate

Approved by the user before implementation.
