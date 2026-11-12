# Editorial Depth Integration

## Goal

Bring the stronger section-to-section depth in `design/rhema-real-estate.vercel.app_.png` into Rhema's existing design system and homepage. Preserve the current fonts, content, data behavior, and editorial land-agency character.

## Skills and documentation read

- `build-editorial-ui`
- Read `AGENTS.md` and the Phase 01, Phase 02, and Phase 11 specifications. This is a visual refinement to the implemented design system and public layout; no SEO behavior is in scope.

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
- `src/app/(public)/layout.tsx`
- `src/app/design-system/page.tsx`
- `src/components/site/site-header.tsx`
- `src/components/site/site-footer.tsx`
- `src/components/journal/home-journal.tsx`
- `src/components/regions/home-region-list.tsx`
- `package.json`
- `prompts/design-system-color-accents.md`
- `prompts/design-system-olive-text-and-nav.md`
- `prompts/design-system.md`

## Decisions and sources

- Use the new image for composition and depth cues: broader image areas, distinct section surfaces, and varied feature/supporting layouts. Keep Rhema's land-focused editorial direction from `design/editorial-reference.png`; do not reuse the new image's unrelated residential/commercial photos as property imagery.
- Preserve the current sans and serif font stacks exactly as defined in `src/app/globals.css`, per the owner's request.
- Use only existing semantic palette tokens from `src/app/globals.css`, including paper, surface, muted surface, ink, terracotta, and olive. Do not introduce new colors, gradients, or glass effects.
- Keep existing copy, real-data behavior, placeholders, routes, and inquiry actions unchanged. The supplied reference contains non-Rhema claims and imagery that must not be copied.
- Approved scope: refine the homepage and its `/design-system` showcase first. Leave secondary public pages unchanged until the owner reviews this direction.
- Leave pre-existing worktree edits untouched. At planning time, `AGENTS.md`, `docs/progress.md`, `docs/specs/phase07-inquiry-forms.md`, `.claude/settings.json`, the new design image, `prompts/critical-live-inquiry-setup.md`, and `supabase/.temp/` were already modified or untracked.

## Files to touch

- `src/app/globals.css`: create a more deliberate rhythm between existing homepage sections and document the reusable treatment with existing tokens.
- `src/app/design-system/page.tsx`: demonstrate the treatment using existing system content and components.
- The homepage already has the section structure and classes needed for the visual treatment; no page markup or data logic changes are needed.
- `docs/progress.md`: record the approved visual direction and validation without disturbing existing notes.

## Acceptance criteria

- The homepage combines the new reference's visual depth with Rhema's existing restrained palette and land-focused content.
- The sans and serif font stacks and their usage do not change.
- All changed colors use existing design tokens; no hard-coded palette colors, gradients, or glass effects are added.
- Routes, copy, data loading, placeholders, links, and inquiry actions retain their current behavior.
- Homepage and showcase have no horizontal overflow at 375px, 768px, and 1440px.
- TypeScript, lint, and production build pass; browser screenshots are reviewed at those widths.

## Manual test steps

1. Open `/` and `/design-system` at 375px, 768px, and 1440px.
2. Compare the homepage's image scale, section rhythm, and contrast with the new reference while checking that it still follows Rhema's existing editorial reference.
3. Confirm the current serif and sans typography look unchanged.
4. Verify that navigation, region loading, journal states, contact actions, and keyboard focus remain usable.
5. Check browser output for horizontal overflow and console/runtime errors.

## Implementation record

- Owner approved the homepage and design-system showcase scope.
- Added the olive feature band and muted token section to the showcase. Added a layered hero frame, inset portfolio treatment, and region tiles to the homepage using existing CSS tokens.
- No font stacks, copy, route behavior, or data loading were changed. Secondary public pages remain unchanged.
- TypeScript, lint, and production build passed. Browser checks at 375px, 768px, and 1440px showed no horizontal overflow and confirmed the existing font stacks.
- The first build attempt omitted `SITE_URL`; it failed as expected for a production build. The final build passed with `SITE_URL=https://rhema.test`.
