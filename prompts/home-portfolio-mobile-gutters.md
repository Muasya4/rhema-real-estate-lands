# Homepage portfolio mobile copy spacing

## Goal

Give the homepage Land portfolio copy and image enough breathing room on phones so the copy does not appear pressed against the panel edge.

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

- The phone CSS currently gives `.home-portfolio-layout` 16px horizontal padding (`--space-4`). Browser screenshot review shows that inset still looks too tight inside the panel.
- Increase only the phone horizontal padding to the existing `--space-6` token (24px), retaining the current vertical padding and stacked image/copy order. Apply the inset to the full inner layout so image and copy align.
- Keep the outer section separators, image caption, copy, image treatments, typography, and link unchanged. Do not create another card or border.
- Verify at 375px, 768px, and 1440px; 768px uses the existing tablet stack and already receives the outer layout's normal padding.

## Files to touch after approval

- `src/app/globals.css`: increase only the phone inline padding for `.home-portfolio-layout`.
- `docs/progress.md`: record the verified spacing fix and responsive review.
- `AGENTS.md`: update the related homepage portfolio known-issues note if necessary.
- This plan: add implementation and validation results.

## Acceptance criteria

- On a 375px phone, the portfolio image and copy have a clear 24px inset from the inner layout edge and share consistent alignment.
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

- Initial implementation restored `var(--space-4)` horizontal padding. Screenshot review showed the copy still looked cramped in the panel, so the approved follow-up is to increase it to `var(--space-6)`.
- Initial implementation at 16px was too tight in screenshot review. Increased phone horizontal padding to `var(--space-6)` (24px).
- At 375px, browser measurement confirms 24px padding and aligned image/copy with no horizontal overflow; screenshot review confirms more breathing room.
- At 768px and 1440px, responsive review confirms the existing tablet and desktop layouts remain intact with no horizontal overflow.
- `npx tsc --noEmit`, `npm run lint`, and `SITE_URL=https://www.rhemarealestates.com npm run build` passed.
- `git diff --check` passed.
