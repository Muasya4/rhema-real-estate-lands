# Public Site Editorial Redesign Plan

## Status

Approved and implemented. TypeScript, lint, tests, and an isolated production build passed. Responsive visual review remains pending because integrated browser automation timed out connecting over CDP.

## Goal

Give every public page a more deliberate editorial composition and a mobile-first layout. Redesign the homepage hero and supporting sections, the About page, property and journal views, regions, contact, and the shared public shell. Display Evans's admin-uploaded portrait as a circular image on the About page and in the admin preview.

## Skills read

- `build-editorial-ui`: reuse the global design tokens, Lucide icons, accessible patterns, and responsive editorial direction.
- `write-rhema-copy`: preserve Rhema-specific plain English and avoid generic marketing copy, eyebrow labels, and em dashes.
- `supabase`: checked the current changelog. This plan reuses the existing leadership profile and Storage upload flow; it does not add a database, Storage, or authorization feature.

## Files inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/specs/phase04-property-listing.md`
- `docs/specs/phase05-property-detail.md`
- `docs/specs/phase06-blog.md`
- `docs/specs/phase07-inquiry-forms.md`
- `docs/progress.md`
- `prompts/design-system-v2-rollout.md`
- `design/events-district-1.png`
- `design/editorial-reference.png`
- `src/app/globals.css`
- All route pages under `src/app/(public)/`
- `src/app/(public)/layout.tsx`
- `src/components/site/site-header.tsx`
- `src/components/site/site-footer.tsx`
- `src/components/site/mobile-site-navigation.tsx`
- `src/components/ui/cards.tsx`
- `src/components/journal/journal-card.tsx`
- `src/components/journal/home-journal.tsx`
- `src/components/regions/home-region-list.tsx`
- `src/components/admin/about/leadership-form.tsx`
- `src/app/admin/about/page.tsx`
- `src/lib/leadership/model.ts`
- `src/lib/leadership/data.ts`
- `src/lib/admin/about/actions.ts`
- `src/lib/admin/about/validation.ts`
- `src/lib/site-content/defaults.ts`

No `context/ui-registry.md` exists. Existing shared components and data flows will be reused.

## Decisions and sources

- **Scope:** all public routes and sections: home, About, property listing/detail, regions, journal listing/article, and contact, plus shared public navigation and footer. Source: the owner's clarification to redesign `all_public_pages`.
- **Visual direction:** keep the existing semantic black, charcoal, warm-white, and gold tokens in `src/app/globals.css`. Use the Events District reference for color and stronger contrast, and the editorial reference for typography, whitespace, and page composition. Do not add a separate palette or hard-coded color values.
- **Page-specific structure:** use distinct editorial hero and section layouts rather than applying one generic panel to every route. Use purposeful image framing, gold rules, clear section hierarchy, and stronger spacing. Keep the existing serif and sans-serif type families.
- **Content and records:** retain existing editable page copy, real Supabase records, image behavior, metadata, routes, status semantics, and inquiry workflows. Do not add fictional property or journal data, unsupported location claims, invented statistics, or placeholder photography.
- **CEO portrait:** the protected `/admin/about` form already uploads the CEO image through the existing `property-images` bucket and stores its path on `leadership_profile`. Present the uploaded portrait as a circular, cover-cropped image on `/about` and in the admin preview. Keep the existing JPEG/PNG/WebP and 5 MiB limits and preserve the current no-image behavior.
- **Mobile:** intentionally compose each page for narrow screens first, then adapt at tablet and desktop widths. Keep forms, actions, navigation, imagery, and card content usable without horizontal overflow.
- **Behavior and data:** no database migration, storage-policy change, permission change, content model, or form behavior change is planned.

## Files to touch

- `src/app/globals.css`: redesign shared public layout, page-specific compositions, cards, typography scale, and responsive rules using existing tokens.
- `src/app/(public)/page.tsx`: strengthen the homepage hero and section structure while keeping current data and copy.
- `src/app/(public)/about/page.tsx`: compose the About intro, company sections, and CEO profile with the circular portrait.
- `src/app/(public)/properties/page.tsx`
- `src/app/(public)/properties/[slug]/page.tsx`
- `src/app/(public)/regions/page.tsx`
- `src/app/(public)/journal/page.tsx`
- `src/app/(public)/journal/[slug]/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/components/site/site-header.tsx` and `src/components/site/site-footer.tsx`: refine the shared public shell if needed for the new compositions.
- `src/components/ui/cards.tsx`, `src/components/journal/journal-card.tsx`, `src/components/journal/home-journal.tsx`, and `src/components/regions/home-region-list.tsx`: align reused public pieces where needed.
- `src/components/admin/about/leadership-form.tsx`: make the current portrait preview match the circular crop used publicly.
- `docs/progress.md` and affected phase documentation: record implementation and known issues after validation.

Do not modify Supabase schemas, data access, authorization, property or journal records, inquiry rules, or unrelated admin pages.

## Acceptance criteria

- All public routes have a clear, page-specific visual hierarchy and no longer rely on a single generic route-intro treatment.
- The homepage hero feels intentional at desktop and mobile widths, and leads naturally into the page sections.
- `/about` shows Evans's uploaded portrait in a circular crop. Replacing the image in the protected admin editor updates the public portrait without changing the existing upload workflow.
- The admin preview displays the same circular crop. With no portrait uploaded, no invented replacement image is shown.
- Property, region, journal, and contact layouts use only existing records, user-managed content, and verified business details.
- Inquiry controls, error/success states, statuses, semantic headings, image alt text, focus indicators, and mobile navigation remain accessible and functional.
- No gradients, glass effects, emoji, eyebrow labels, hard-coded palette colors, horizontal overflow, or fabricated content are introduced.
- TypeScript, lint, tests, and production build pass.
- Browser review verifies the public pages at 375px, 768px, and 1440px.

## Manual test steps

1. Review the homepage hero and each homepage section at 375px, 768px, and 1440px.
2. Review `/about` with and without a portrait, including circular crop, biography wrapping, and the email link.
3. In an authenticated admin session, upload or replace the CEO portrait through `/admin/about`; verify the circular preview and saved public image. Do not perform a hosted upload without explicit authorization.
4. Review property listing and detail pages with image-present, image-absent, incomplete, empty, and unavailable states.
5. Review region listings, journal empty/list/article states, contact actions, and the inquiry form.
6. Check header menu behavior, keyboard focus, touch targets, line wrapping, and horizontal overflow at all three viewport widths.
7. Confirm routes, metadata, record visibility, inquiry behavior, and image permissions remain unchanged.

## Implementation and validation results

- Implemented the page-specific responsive layouts, homepage hero refinements, circular About portrait, matching admin preview, and visual details described above.
- Preserved existing routes, content, data access, inquiry behavior, and image-upload rules. No hosted database changes, uploads, or permission changes were made.
- `npx tsc --noEmit`, `npm run lint`, and `npm test` passed; the test suite reported 142 passing tests.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory. The temporary directory and build-generated TypeScript configuration changes were removed afterward.
- The integrated browser connection timed out over CDP. Screenshot, interaction, and responsive checks at 375px, 768px, and 1440px could not be completed. The actual About portrait crop with an uploaded image also remains unverified.

### Homepage hero first-screen refinement

The approved follow-up compresses the homepage hero for the initial viewport, removes the hero image's `01` marker, and gives that image an organic border-radius shape. The separate portfolio image marker remains unchanged. The shared browser preview at 1200×450 showed the full header, hero copy, actions, image, and caption in the first screen. Responsive screenshots at 375px, 768px, and 1440px remain pending because the browser automation connection timed out.
