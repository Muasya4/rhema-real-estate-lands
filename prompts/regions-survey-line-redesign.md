# Regions Survey-Line Redesign

## Status

Approved and implemented. TypeScript, lint, tests, and an isolated production build passed. Responsive visual review remains pending because browser navigation and direct local route requests did not complete.

## Goal

Remove decorative numbering from the homepage portfolio image and region lists. Redesign the homepage Regions in focus section and the Regions page list as an open, land-inspired editorial layout without plain boxed cards. Keep the enquiry guide's 01–03 labels because they communicate the order of its steps.

## Skills read

- `build-editorial-ui`: preserve the editorial system, responsive layout, and token usage.
- `write-rhema-copy`: keep any labels or text specific to Rhema and do not add generic marketing copy.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `src/app/(public)/page.tsx`
- `src/app/(public)/regions/page.tsx`
- `src/components/regions/home-region-list.tsx`
- `src/app/globals.css`
- `src/lib/regions/data.ts`
- `src/lib/site-content/defaults.ts`
- `prompts/sculpted-hero-image-shape.md`
- Existing region and homepage layout rules in `globals.css`
- No `context/ui-registry.md` exists.

## Decisions and sources

- **Numbering:** remove the decorative `02` portfolio image index and all index numbers from the homepage region list and `/regions`. Keep `01`, `02`, and `03` on the enquiry steps because they express process order. Source: the owner's selection of direction 1.
- **Land visual:** use a restrained abstract survey/parcel-line motif made of irregular, open boundary strokes. It is decorative, not a literal map and does not imply geographic positions, plot measurements, boundaries, or property availability. Source: the owner's selection of survey lines.
- **Region layout:** replace boxed region tiles with an open text-led arrangement of region names, generous spacing, and fine token-based separators. Keep the existing data and ordering. Do not invent region descriptions, counts, coordinates, or destination links.
- **Palette and style:** use existing semantic CSS variables in `globals.css`. No hard-coded colors, gradients, cards, or decorative numbers.
- **Scope:** retain existing copy, routes, data access, enquiry guide, and all non-region page layouts.

## Files to touch after approval

- `src/app/(public)/page.tsx`: remove the portfolio image's decorative `02` marker.
- `src/components/regions/home-region-list.tsx`: remove decorative index values from homepage region markup.
- `src/app/(public)/regions/page.tsx`: remove decorative index values from the public Regions listing.
- `src/app/globals.css`: replace the boxed region styles with the open layout and add responsive survey-line presentation using existing tokens.
- `docs/progress.md`: record implementation, checks, and any visual review limitations.
- This plan: record implementation and validation results.

Do not change the enquiry steps, region records, page copy, database, or content editor.

## Acceptance criteria

- No decorative numeric labels remain on the portfolio image or either region list.
- The enquiry step sequence remains visibly numbered 01–03.
- Homepage and Regions page show region names in an unboxed editorial layout.
- The survey/parcel-line art suggests land division without representing real boundaries or exact geography.
- Region names and ordering continue to come from the existing region query.
- No invented region descriptions, links, statistics, or coordinates are introduced.
- TypeScript, lint, production build, and `git diff --check` pass.
- Responsive layouts are reviewed at 375px, 768px, and 1440px when browser automation is available.

## Manual test steps

1. Review the homepage portfolio section and confirm its image no longer shows `02`.
2. Review homepage regions and `/regions`; confirm there are no numeric region labels or boxed cards.
3. Confirm the abstract survey-line drawing is decorative and does not appear to be a geographic map or property plan.
4. Confirm the enquiry steps still show 01–03.
5. Confirm region loading, error, empty, and populated states still work with existing query data.
6. Review at 375px, 768px, and 1440px for readable text, balanced spacing, and no horizontal overflow.

## Implementation and validation results

- Removed the portfolio image's `02` index and decorative indexes from both region lists. Kept the enquiry step labels 01–03.
- Replaced home and Regions page region tiles with an open text-led layout and shared abstract parcel-boundary line art. Region data, order, and loading/error behavior remain query-driven.
- `npx tsc --noEmit`, `npm run lint`, and `npm test` passed; all 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory. The temporary directory and generated `tsconfig.json` changes were removed.
- `git diff --check` passed.
- The integrated browser could not navigate to the updated Regions page, and bounded direct HTTP checks of the local homepage and Regions route did not complete. Responsive screenshots at 375px, 768px, and 1440px remain pending.
