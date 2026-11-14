# Remove Regions Illustration

## Status

Approved and implemented. TypeScript, lint, all 142 tests, and an isolated production build passed. Responsive visual review remains pending because browser automation could not connect to the updated local pages.

## Goal

Remove the disliked survey-line illustration from the homepage Regions in focus section and the `/regions` page. Keep the approved open, unboxed region lists, fine separators, current region data/order, and the enquiry step numbers.

## Skills read

- `build-editorial-ui`: preserve the existing editorial layout and design tokens.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `src/components/regions/region-survey-lines.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/regions/page.tsx`
- `src/components/regions/home-region-list.tsx`
- `src/app/globals.css`
- `docs/progress.md`
- `prompts/regions-survey-line-redesign.md`
- No `context/ui-registry.md` exists.

## Decisions and sources

- **Remove rather than replace the drawing:** the owner selected `remove` after reviewing the proposed choices. Do not introduce a new image or graphic.
- **Keep the open text-led region layout:** retain region names, the existing query order, and subtle separators. Remove only the illustration and layout space reserved for it.
- **Keep enquiry step labels:** the 01–03 labels communicate process order and remain unchanged.
- **Keep behavior unchanged:** retain loading, error, route, and data behavior. No copy, data, or admin editor changes.

## Files to touch after approval

- `src/app/(public)/page.tsx`: remove the survey illustration from Regions in focus and remove the now-unneeded wrapper.
- `src/app/(public)/regions/page.tsx`: remove the survey illustration and its layout wrapper.
- `src/components/regions/region-survey-lines.tsx`: delete the unused component.
- `src/app/globals.css`: remove survey illustration styles and simplify the region list layout without changing the open list or separators.
- `docs/progress.md`: document the removal, validation, and any remaining visual-review limitations.
- `AGENTS.md`: update the known-issues note so it no longer describes survey lines as part of the current design.
- This plan: record implementation and test results.

## Acceptance criteria

- No survey illustration or unused survey-line component remains.
- Both region lists retain their open, unboxed style and separators.
- Region names and ordering remain query-driven.
- Enquiry steps remain numbered 01–03.
- TypeScript, lint, production build, and `git diff --check` pass.
- Review responsive behavior at 375px, 768px, and 1440px when browser automation is available.

## Manual test steps

1. Review the homepage Regions in focus section and confirm only the open region list remains.
2. Review `/regions` and confirm only the open region list remains.
3. Confirm region ordering, loading, and error behavior are unchanged.
4. Confirm the enquiry steps still show 01–03.
5. Check for horizontal overflow and appropriate spacing at 375px, 768px, and 1440px.

## Implementation and validation results

- Removed the survey illustration from the homepage Regions in focus section and `/regions`, deleted its component, and removed the layout CSS reserved for it.
- Kept both open region lists, their separators, existing query ordering, and the 01–03 enquiry step labels.
- `npx tsc --noEmit`, `npm run lint`, and `npm test` passed; all 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory. The temporary directory and generated `tsconfig.json` changes were removed.
- `git diff --check` passed.
- Browser automation and bounded direct HTTP checks could not complete, so visual review at 375px, 768px, and 1440px remains pending.
