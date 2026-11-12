# About company page and editable CEO profile

## Goal

Create a public About page for Rhema Real Estates, add it to desktop and mobile primary navigation and the site footer, and provide an admin-managed CEO section for Evans. Admins can update the displayed name, role, email, optional biography, and portrait image.

## Skills read

- `build-editorial-ui`
- `write-rhema-copy`
- `supabase`
- `supabase-postgres-best-practices`

## Files inspected

- `AGENTS.md`
- `docs/product.md`
- `docs/progress.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/specs/phase11-seo-jsonld.md`
- `src/app/(public)/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/properties/page.tsx`
- `src/app/(public)/regions/page.tsx`
- `src/components/site/site-header.tsx`
- `src/components/site/site-footer.tsx`
- `src/components/site/mobile-site-navigation.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/journal/new/page.tsx`
- `src/components/admin/journal/journal-form.tsx`
- `src/lib/admin/journal/actions.ts`
- `src/lib/admin/journal/data.ts`
- `src/lib/admin/journal/state.ts`
- `src/lib/storage/image-validation.ts`
- `src/lib/regions/data.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/auth-server.ts`
- `supabase/migrations/20261106194113_initial_content_schema.sql`
- `supabase/migrations/20261111071552_admin_managed_regions.sql`
- `supabase/tests/database/content_schema_test.sql`
- `src/app/globals.css`
- `src/lib/seo/site-url.ts`
- `design/editorial-reference.png`
- Current Supabase changelog index and Storage access-control and Postgres RLS documentation

## Decisions and sources

- Use `/about` as the route and page title "About Rhema Real Estates". Source: requested About page and existing route conventions.
- Add "About" to the shared navigation links in `SiteHeader`, which also supplies the mobile menu, and add it to `SiteFooter`. Sources: existing header/footer navigation arrays and Phase 02.
- State only that Rhema Real Estates sells plots in the Nairobi Metropolitan Area, Kiambu, Machakos, Kajiado and Central Kenya. Source: `docs/product.md`, `AGENTS.md`, and current public page copy.
- Identify "Evans" as Chief Executive Officer and seed `evans@rhemarealestates.com` as the editable contact email. Source: user request. Do not invent a surname, biography, founding date, company history, certifications, or unsupported business claims. The optional biography starts empty until supplied by an admin.
- Store one CEO profile in a dedicated `public.leadership_profile` singleton row, publicly readable and writable only by admins. Seed only the confirmed name, role, and email. Source: user request, existing `admin_roles` RLS pattern, and Supabase's documented table RLS guidance.
- Add an admin page at `/admin/about`, protected by `requireAdmin` in the page and server action. Source: existing `/admin` and Journal management patterns and `AGENTS.md` server-side authorization requirement.
- Upload the portrait under the `leadership/` path in the existing public-read/admin-write `property-images` bucket, reusing the shared content-verified JPEG/PNG/WebP validation and 5 MiB limit. Do not introduce a new bucket or public upload policy. Source: `src/lib/storage/image-validation.ts`, existing Journal upload flow, current project storage architecture, and Supabase Storage access-control docs.
- If an image is replaced or removed, clean up its old Storage object only after the new profile save succeeds, and report cleanup failures explicitly. Source: existing Journal image replacement pattern.
- Add an imperative migration using the repository's Supabase CLI workflow, with singleton constraint, updated-at behavior, grants, RLS policies, and the initial profile row. Add database tests for public read/admin write/non-admin denial.
- Use a concise editorial introduction, company description, and CEO contact section based on the existing public route structure. Source: public page styling in `globals.css`, existing route pages, and the editorial UI skill.
- Use `buildPageMetadata` for the canonical About-page metadata. Source: `src/lib/seo/site-url.ts` and Phase 11.
- Use existing design tokens and page styles. Avoid hard-coded colors, decorative filler, and unsupported claims.

## Files to touch

- `src/app/(public)/about/page.tsx` (new)
- `src/components/site/site-header.tsx`
- `src/components/site/site-footer.tsx`
- `src/app/admin/about/page.tsx` (new)
- `src/app/admin/page.tsx`
- `src/components/admin/about/leadership-form.tsx` (new)
- `src/lib/admin/about/actions.ts` (new)
- `src/lib/admin/about/data.ts` (new)
- `src/lib/admin/about/state.ts` (new)
- `src/lib/admin/about/validation.ts` (new)
- New migration generated with the Supabase CLI
- `supabase/tests/database/content_schema_test.sql` or a focused new database test
- Focused Node tests for profile validation, data, and admin actions
- `src/app/globals.css` only if a distinct About layout needs styling not covered by the existing page system
- `docs/progress.md`
- `AGENTS.md` under `## Known issues`

## Acceptance criteria

- `/about` renders within the shared public shell and has unique, accurate canonical metadata.
- Desktop and mobile navigation and footer each link to `/about`.
- Page content identifies Rhema's work and coverage using only confirmed facts.
- Evans is identified as CEO; the editable email opens a mailto link, and the CEO name, title, email, optional biography, and image are loaded from the managed profile.
- An authenticated admin can update profile text and upload, replace, or remove the portrait from `/admin/about`; every server action checks admin authorization.
- The migration seeds the confirmed profile details and enforces public read/admin-only write with RLS. A regular authenticated non-admin cannot mutate the profile.
- Profile images use existing JPEG, PNG, or WebP validation, the 5 MiB limit, and the existing public-read/admin-write bucket.
- The migration is added locally only. It is not applied to the hosted Supabase project as part of this task.
- Responsive layout uses existing design tokens and does not introduce horizontal overflow.
- Existing worktree changes are preserved.
- TypeScript, focused tests, lint, and production build pass; browser review covers mobile, tablet, and desktop where browser tooling is available.

## Manual test steps

1. Open `/about` directly and confirm the page, title, description, and canonical metadata.
2. Follow the About link from the desktop navigation and footer.
3. At mobile width, open the hamburger menu, follow the About link, and confirm the route loads.
4. Confirm the CEO email link targets `mailto:evans@rhemarealestates.com`.
5. In admin, edit the CEO profile, upload a valid image, save, and confirm the public page updates.
6. Confirm unsupported/mismatched image files and oversized images are rejected, and a non-admin cannot access the editor or mutate profile data.
7. Review the page at 375px, 768px, and 1440px for readable text, intended hierarchy, and no horizontal overflow.
8. Apply the generated migration and run the database RLS tests only in a disposable or approved non-production Supabase-compatible environment; do not make hosted database changes as part of this implementation.
