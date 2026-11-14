# Simplify Homepage Land Portfolio

## Status

Approved and implemented. The layered portfolio frames were removed, and the portfolio now stacks at tablet and mobile widths. TypeScript, lint, all 142 tests, the isolated production build, and responsive browser review passed.

## Goal

Remove the stacked square outlines and card-like border around the homepage Land portfolio image. Improve the mobile spacing from the “Ask Rhema about plots in your area” heading and description through to the “Enquire about land” link, without changing the existing copy.

## Skills read

- `build-editorial-ui`: follow the current editorial style and CSS tokens.
- `write-rhema-copy`: preserve concise Rhema-specific copy and avoid unnecessary copy changes.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `src/app/(public)/page.tsx`
- `src/app/globals.css`
- `src/lib/site-content/defaults.ts`
- `docs/progress.md`
- No `context/ui-registry.md` exists.

## Decisions and sources

- Remove the portfolio figure's outer border, padding, surface background, and inset image outline that create the layered square effect. The image and caption remain.
- Keep the portfolio section's horizontal separator rules; they define the section and do not create another enclosing square.
- Leave the title, descriptions, and CTA text unchanged. They are content-managed, and this request is about their mobile spacing.
- Improve mobile text rhythm using existing spacing tokens and the existing mobile breakpoint in `globals.css`; do not introduce hard-coded colors or arbitrary measurements.
- Browser review showed the two-column layout remained cramped at 768px, so stack the image and copy below the existing tablet breakpoint. This keeps the heading and CTA readable through the full mobile/tablet range.
- Keep the hero's sculpted image treatment and other image frames unaffected.

## Files to touch after approval

- `src/app/globals.css`: remove the portfolio-specific nested frame styling and refine mobile spacing for its heading, paragraphs, and link.
- `docs/progress.md`: record the implemented change, validation, and any remaining visual-review limitations.
- `AGENTS.md`: update the relevant known-issues entry if the responsive review status changes.
- This plan: record implementation and test results.

## Acceptance criteria

- The homepage Land portfolio image no longer has multiple nested square borders or a padded outer card.
- The image caption, section separators, and existing portfolio copy remain intact.
- At mobile width, the title, descriptive copy, and CTA have deliberate, consistent spacing and do not appear crowded or detached.
- The hero's sculpted shape and unrelated image framing remain unchanged.
- TypeScript, lint, production build, and `git diff --check` pass.
- Review the homepage at 375px, 768px, and 1440px.

## Manual test steps

1. Open the homepage and inspect the Land portfolio section on desktop. Confirm the image is not surrounded by stacked square outlines or an outer card.
2. At 375px and 768px, review the spacing from the portfolio heading through its copy to the “Enquire about land” link.
3. Confirm the caption and horizontal section separators remain visible, and the hero image framing is unchanged.
4. Check for horizontal overflow at all three target widths.

## Implementation and validation results

- Removed the portfolio figure's outer border, padding, surface background, image-frame border, and inset outline. Kept the image, caption, and section separators.
- Adjusted heading width and paragraph/CTA spacing for widths up to 1024px. The image and copy stack in that range because browser review showed the previous 768px two-column layout cramped the copy.
- TypeScript passed; lint passed; `npm test` passed with all 142 tests.
- Browser review at 375px, 768px, and 1440px confirmed the removed nested frames, stacked tablet/mobile layout, and no horizontal overflow.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory. The temporary directory and generated `tsconfig.json` changes were removed.
- `git diff --check` passed.
