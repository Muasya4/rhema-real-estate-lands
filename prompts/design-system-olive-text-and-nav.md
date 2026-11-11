# Design-System Olive Text and Navigation Refinement

## Goal

Keep the olive introduction band, replace its current soft-terracotta text accents with more legible coordinated palette colors, and restore the navigation header to its original paper styling.

## Skills and documentation read

- No installed skill matches this focused CSS adjustment.
- Inspected `AGENTS.md`, the design-system stylesheet and page, and the progress record.
- The requested current phase spec is not present: `docs/specs/` does not exist.

## Files inspected

- `AGENTS.md`
- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `docs/progress.md`
- `prompts/design-system-color-accents.md`

## Decisions and sources

- Keep the olive background (`--color-olive`), as requested.
- Change the small “Rhema Real Estates / Foundation” label from soft terracotta to white for strong contrast on olive.
- Change the large italic “land.” highlight to ink (`--color-ink`) for a distinct, readable editorial contrast against olive. Do not use soft olive on the olive background.
- Restore the navigation to `--color-paper` with the original bottom rule, muted brand descriptor and links, terracotta link hover, and default outlined CTA.
- Remove the dark-header foreground and CTA overrides added for the ink navigation band. Keep the existing shared visible focus behavior.
- Do not alter the olive background, remaining content sections, or other component colors.

## Files to touch

- `src/app/globals.css`: revise only the navigation and olive-intro colors.
- `docs/progress.md`: record the text contrast and navigation restoration.

## Acceptance criteria

- The olive band remains unchanged.
- Its foundation label is white and its italic `land.` highlight uses `--color-ink`.
- The navigation again matches the original warm paper treatment and muted link colors, with the original outlined CTA.
- Remaining page sections/components retain their palette.
- TypeScript, lint, and production build pass; production screenshots at desktop/mobile show no horizontal overflow.

## Manual test steps

1. Open `/design-system` and verify the olive background and updated accent text.
2. Verify the header background, brand description, navigation links, hover, and CTA return to their original warm paper treatment.
3. Check keyboard focus on navigation controls.
4. Inspect the production page at desktop and mobile widths and confirm no horizontal overflow or changes below the intro.
