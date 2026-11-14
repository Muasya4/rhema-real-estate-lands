# Homepage portfolio mobile gutters

## Goal

Make the homepage Land portfolio copy and image feel comfortably inset on phones instead of sitting against the section's content edge.

## Skills read

- `build-editorial-ui`: use the existing editorial layout, design tokens, and responsive review.
- `write-rhema-copy`: preserve approved customer-facing copy.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `docs/progress.md`
- `src/app/(public)/page.tsx`
- `src/app/globals.css`
- `src/lib/site-content/defaults.ts`
- `prompts/simplify-home-portfolio-framing.md`
- Existing shared homepage browser pages at `http://localhost:3000/`
- No `context/ui-registry.md` exists.

## Decisions and sources

- The existing mobile rule in `src/app/globals.css` sets `.home-portfolio-layout` to `padding: var(--space-4) 0`, which deliberately removes left and right inset from the content. This is the direct cause of the copy feeling flush.
- At viewport widths up to 760px, add an inset horizontal gutter using the existing `--space-4` token while keeping the current vertical spacing and stacked image/copy order. Apply the gutter to the full inner layout so image and text align on a shared editorial grid.
- Keep the outer section separators, image caption, copy, image treatments, typography, and link unchanged. Do not create another card or border.
- Verify at 375px, 768px, and 1440px; 768px uses the existing tablet stack and already receives the outer layout's normal padding.

## Files to touch after approval

- `src/app/globals.css`: fix only the mobile inline padding for `.home-portfolio-layout`.
- `docs/progress.md`: record the verified spacing fix and responsive review.
- `AGENTS.md`: update the related homepage portfolio known-issues note if necessary.
- This plan: add implementation and validation results.

## Acceptance criteria

- On a 375px phone, the portfolio image and copy no longer touch the inner section content edge and share a consistent inset.
- The heading, descriptions, CTA, caption, and section separators remain intact.
- Existing tablet and desktop layout remain unchanged.
- No extra card/border or hard-coded palette values are introduced.
- TypeScript, lint, production build, and `git diff --check` pass.
- Review the section at 375px, 768px, and 1440px and check for horizontal overflow.

## Manual test steps

1. Review the portfolio section at 375px and compare its left/right inset with the image and copy. Confirm the content no longer feels flush.
2. At 768px, verify the existing stacked tablet layout and comfortable spacing remain unchanged.
3. At 1440px, verify the two-column editorial layout remains unchanged.
4. Confirm the section rules, image, copy, caption, and CTA remain visible and no horizontal overflow occurs at all three widths.

## Implementation and validation results

- At the phone breakpoint, kept the existing vertical padding and restored `var(--space-4)` horizontal padding on the inner portfolio layout. This insets the text and image together without adding a card or border.
- `npx tsc --noEmit` passed.
- `git diff --check` passed.
- `npm run lint` passed.
- The production build passed using a temporary isolated output directory; the directory and generated `tsconfig.json` changes were removed.
- Browser measurements at requested widths 375px, 768px, and 1440px found no horizontal overflow. The portfolio image and copy align at 16px on mobile, retain the tablet gutter, and remain two-column at desktop.
