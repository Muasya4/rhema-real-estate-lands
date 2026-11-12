# Deep Green and Sitewide Page Depth

## Goal

Complete the visual integration of `design/rhema-real-estate.vercel.app_.png` with Rhema's existing editorial system. Establish the deep green as a named design token, give the homepage hero a confident green field, remove the awkward offset panel around the hero image, and apply deliberate visual depth across the approved public-page scope. Preserve the current fonts.

## Skills and documentation read

- `build-editorial-ui`
- Read `AGENTS.md`, Phase 01 Design System, Phase 02 Layout Shell, and Phase 11 SEO specifications.
- Reviewed the version-matched Next.js global CSS and layout documentation.

## Files inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/specs/phase11-seo-jsonld.md`
- `docs/progress.md`
- `design/rhema-real-estate.vercel.app_.png`
- `design/editorial-reference.png`
- `src/app/globals.css`
- `src/app/(public)/page.tsx`
- `src/app/(public)/properties/page.tsx`
- `src/app/(public)/properties/[slug]/page.tsx`
- `src/app/(public)/regions/page.tsx`
- `src/app/(public)/journal/page.tsx`
- `src/app/(public)/journal/[slug]/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/design-system/page.tsx`
- `src/components/site/site-header.tsx`
- `src/components/site/site-footer.tsx`
- `src/components/ui/navigation.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/cards.tsx`
- `src/components/journal/home-journal.tsx`
- `src/components/regions/home-region-list.tsx`

## Decisions and sources

- The new design image is the visual source for the deep forest green and broader use of solid-color fields. Record green as a semantic CSS token and display it in the design-system color inventory rather than scattering hex values.
- Use `#193d32` as the forest token value, visually sampled from the deep green feature band in `design/rhema-real-estate.vercel.app_.png`.
- Keep the current editorial serif and Geist sans stacks exactly unchanged.
- Give the homepage hero a deep-green background with accessible white/light text and suitable link/button states.
- Remove the offset olive rectangle and padding around the hero photo; retain the photo and caption without a decorative outer box.
- Apply consistent green hover/focus treatments to shared public navigation and appropriate interactive elements. Use green in a few other page sections and footer for rhythm, balanced by the existing warm neutrals.
- Make public route intros, content surfaces, and detail layouts feel coherent with the new system without changing copy, routes, data behavior, or SEO metadata.
- Update `/design-system` to document the new green token, color roles, and interaction states using actual design tokens.
- Exclude admin UI from this visual pass.
- Owner approved the all-public-pages scope; shared navigation/footer and public detail, listing, region, journal, and contact pages are included.

## Files to touch

- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `src/components/site/site-header.tsx` only if accessible interaction semantics require a structural class/state
- `src/components/site/site-footer.tsx` only if a shared treatment needs a semantic class
- Public route page components only where an explicit semantic class is needed to support the styles
- `docs/progress.md`

## Acceptance criteria

- A named deep-green token appears in the root palette and design-system showcase; all new green uses reference the token.
- The home hero uses the deep-green field and has readable contrast for headings, copy, links, focus states, and CTA.
- The offset outer rectangle around the hero photo is gone.
- Shared public navigation hover/focus uses the deep green consistently.
- The selected public-page scope has balanced, repeatable depth and still reads as Rhema's land-focused editorial system.
- No font-family, font loading, or typography stack changes; no new copy, gradients, or glass effects.
- TypeScript, lint, production build, and browser review at 375px, 768px, and 1440px pass.

## Manual test steps

1. Check public navigation hover and keyboard focus against light and dark surfaces.
2. Inspect the home hero and verify its photo has no offset colored frame.
3. Review the design-system color inventory and interaction examples against the new palette.
4. Visit the approved public routes on mobile, tablet, and desktop, checking contrast, section depth, and overflow.
5. Confirm the font families and existing links, forms, and data states are unchanged.

## Implementation record

- Added `--color-forest` (`#193d32`) and the `forest` button variant. The `/design-system` color inventory and interaction examples now show the forest token and hover behavior.
- Applied the forest treatment to the homepage hero and contact band, public route introductions and detail headers, shared navigation/footer states, and selected public content surfaces.
- Removed the hero image's offset frame. Preserved current fonts, copy, route/data behavior, and admin UI.
- `npx tsc --noEmit`, `npm test` (109 passed), `npm run lint`, and production build with `SITE_URL=https://rhema.test` passed.
- Browser review at 375px, 768px, and 1440px found no horizontal overflow on the home, design-system, properties, regions, journal, and contact routes. The checks confirmed the forest hero/route panels, missing hero-frame decoration, and unchanged font stacks.
- Browser automation intermittently failed to navigate during review. Direct HTTP requests to the reviewed public routes returned 200.
