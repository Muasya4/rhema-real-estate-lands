# Design-System Color Accents

## Goal

Add one or two intentional solid-color areas to the `/design-system` showcase, using only existing palette tokens, while keeping the editorial page calm and readable.

## Skills and documentation read

- No installed skill matches this focused styling change.
- Reviewed the project instructions and existing design-system styles/components.
- The requested current phase spec is unavailable: `docs/specs/` does not exist.

## Files inspected

- `AGENTS.md`
- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `src/components/ui/navigation.tsx`
- `docs/progress.md`
- `prompts/design-system.md`

## Decisions and sources

- Use the provided existing color tokens only; do not introduce new color values.
- Recommendation: set the slim navigation band to `--color-ink` with `--color-white` text, and give the larger editorial introduction a full-width `--color-olive` background with white text.
- Keep the introduction's existing content width and layout; extend the background to the viewport edges.
- Make the intro's terracotta italic title legible on olive by using `--color-accent-soft`, an existing pale palette token.
- Preserve the paper background and all remaining showcase sections, cards, fields, buttons, and status colors.
- Keep the CTA outlined in white on the dark navigation band. Maintain visible keyboard focus.
- Use the palette and type/space values already defined in `globals.css`, with no additional dependencies.

## Files to touch

- `src/app/globals.css`: add token-based inverse styles for the header and intro section.
- `src/app/design-system/page.tsx`: mark the introduction section with a scoped accent class.
- `docs/progress.md`: record the approved color treatment and verification.

## Acceptance criteria

- One compact dark-ink navigation band and one olive editorial intro create two separated but coordinated solid-color areas.
- Text, links, focus states, and CTA remain readable against the darker backgrounds.
- All colors come from existing tokens; the remaining page continues to use the warm neutral palette.
- No horizontal overflow at desktop or narrow mobile widths.
- TypeScript, lint, and production build pass; inspect production screenshots on desktop and mobile.

## Manual test steps

1. Open `/design-system` at desktop width and check the dark header and olive intro against the neutral page sections below.
2. Verify CTA hover and keyboard focus visibility on the dark header.
3. Check the intro typography and copy for contrast on the olive background.
4. Open at a narrow mobile width and confirm navigation wrapping and no horizontal overflow.
5. Confirm all subsequent components retain their existing neutral backgrounds and colors.
