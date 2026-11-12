# Homepage Hero and Olive Refinement

## Goal

Make the homepage hero more compact so the main content fits in a typical desktop first viewport, replace the awkward nav-to-hero rule with deliberate spacing, clarify restrained olive usage, correct footer text contrast, and document the color roles in the design-system showcase. Preserve the existing fonts, copy, routes, and behavior.

## Skills and documentation read

- `build-editorial-ui`
- `write-rhema-copy`
- `AGENTS.md`
- Current Phase 11 SEO spec in `docs/specs/phase11-seo-jsonld.md`
- The installed Next.js docs are not needed for this CSS-focused change; no Next.js API will be changed.

## Files inspected

- `AGENTS.md`
- `docs/specs/phase11-seo-jsonld.md`
- `src/app/(public)/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `docs/progress.md`
- `prompts/design-system-color-accents.md`
- `prompts/design-system-olive-text-and-nav.md`
- `context/ui-registry.md` was not present in the repository.
- Shared local homepage at `http://127.0.0.1:3035/`

## Decisions and sources

- Keep all existing typefaces and public homepage copy unchanged, per the user's explicit direction and the existing hero.
- Compact the hero using existing spacing and type tokens, a shorter image aspect ratio, and a tighter column gap. The source is the current oversized hero visible in the shared browser page and its current `globals.css` rules.
- Remove the bottom rule only where the shared header directly precedes the homepage main element. Add a small token-based top gap before the hero so the paper surface provides separation without a hard line. Do not change the header treatment on other routes.
- Keep `--color-forest` (`#193d32`) as the hero surface. Use `--color-olive-soft` (`#e5e9e1`) for highlighted wording against forest, where it remains legible. Use `--color-olive` (`#65715a`) only for small accents on light surfaces; avoid dark olive text on forest.
- Correct footer foreground colors to `--color-white`, matching the forest footer background. Preserve the existing olive-soft hover state and focus outline.
- Expand the design-system color guidance to explain these olive roles and demonstrate the forest/olive-soft pairing. The colors and values come from the existing tokens in `globals.css` and existing design-system swatches.
- No new color values, font changes, customer-facing copy changes, components, or dependencies. The design-system explanation is intentionally updated.

## Files to touch after approval

- `src/app/(public)/page.tsx`: add a scoped homepage main class for the header/hero separation rule.
- `src/app/globals.css`: compact hero layout, remove only the homepage header rule, add the small hero gap, introduce small token-based olive accents, and fix footer text contrast.
- `src/app/design-system/page.tsx`: document olive and olive-soft roles for future design work.
- `docs/progress.md`: record the completed visual refinement and validation.

## Acceptance criteria

- On a 1440px-wide desktop viewport at 900px height, the navigation and full hero are visible without scrolling.
- The homepage header has no divider line above the hero; a modest, intentional gap remains between them.
- At 375px and 768px, the hero remains readable, ordered, and free of horizontal overflow.
- Footer brand descriptor, links, and phone text are legible white against forest; focus remains visible.
- Olive is documented as a restrained light-surface accent, and olive-soft as the emphasized-word color on forest.
- Existing font stacks and customer-facing page copy, other route headers, and admin UI remain unchanged.
- TypeScript, lint, production build, and responsive browser checks pass.

## Manual test steps

1. Review the homepage at 1440×900 and confirm the header and full hero fit above the fold, with no divider and a modest gap.
2. Review at 768px and 375px; verify stacking, text wrapping, image sizing, and no horizontal overflow.
3. Check hero highlighted wording against the forest background.
4. Scroll to the footer and confirm foreground text contrast, link hover, and keyboard focus.
5. Open `/design-system` and confirm the olive roles are visible and correspond to the existing swatches.
6. Check a non-home public route to confirm its header divider remains unchanged.

## Implementation record

- Tightened the hero at desktop and mobile breakpoints, removed the divider only before the homepage, and added a small token-based gap.
- Used soft olive for selected wording and the location marker on forest, and olive for small details on light surfaces.
- Corrected footer text specificity so all foreground copy remains white over forest.
- Updated `/design-system` with explicit olive contrast and usage roles. Existing typefaces and customer-facing copy are unchanged.
- TypeScript, lint, tests, and production build passed. Browser checks at 1440×900, 768×900, and 375×812 confirmed no horizontal overflow; the hero fits above the fold at 1440×900 and 768×900.
- The isolated preview's direct homepage request returned `ERR_INCOMPLETE_CHUNKED_ENCODING`, so the hero layout was checked with the built stylesheet and homepage markup fixture. The `/design-system` route rendered successfully and displayed the updated guidance.
