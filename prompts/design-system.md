# Design System Implementation Plan

## Goal

Implement a reusable editorial design system guided by `design/editorial-reference.png`, then expose its tokens and components on `/design-system`. Do not replace or build the production homepage or any other site pages.

## Skills and documentation read

- No installed skill matches this existing Next.js UI implementation.
- Read the installed Next.js App Router documentation for layouts and pages, server and client components, CSS, and font optimization under `node_modules/next/dist/docs/01-app/01-getting-started/`.
- The requested current phase spec was not present: `docs/specs/` does not exist.

## Files inspected

- `AGENTS.md`
- `design/editorial-reference.png`
- `docs/product.md`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `package.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `next.config.ts`
- `README.md`

## Decisions and sources

- Treat the supplied reference image as the visual source of truth: warm paper backgrounds, restrained charcoal text, terracotta accents, generous whitespace, quiet small labels, and editorial serif headlines.
- Define semantic color tokens in `globals.css`, with initial hex values calibrated visually against the reference because it does not provide design-token metadata.
- Use a 4px spacing base with a compact, named spacing scale; define type sizes, line heights, radii, and shared focus/interaction styles as CSS custom properties.
- Retain the existing Geist sans family for supporting text and use an editorial system-serif stack for headlines. The initial Cormorant Garamond `next/font` build failed because the font download timed out, so the system stack avoids a network-only build dependency while preserving the reference's serif contrast.
- Use native, semantic server-rendered React components with typed button variants, status values, and field props. The showcase requires no client-side behavior.
- Add Lucide React for restrained navigation/action icons. It is not currently installed; update the package manifest and lockfile using npm after approval.
- Demonstrate property/blog cards with clearly generic specimen content and neutral placeholders, not invented prices or factual property claims.
- Keep the existing homepage unchanged. `/design-system` is solely a visual inventory of tokens and reusable components, not a production page.
- Keep the showcase layout responsive and use the repository's existing Tailwind/global CSS setup without adding a styling dependency.

## Files to touch

- `src/app/globals.css`: tokens, global foundations, and component styles.
- `src/app/layout.tsx`: display font and relevant site metadata.
- `src/components/ui/button.tsx`
- `src/components/ui/fields.tsx`
- `src/components/ui/cards.tsx`
- `src/components/ui/status-badge.tsx`
- `src/components/ui/navigation.tsx`
- `src/app/design-system/page.tsx`: tokens/components showcase.
- `package.json` and `package-lock.json`: add `lucide-react`.
- `docs/progress.md`: record the completed design-system phase, if the existing project context has no more specific progress-file format.

## Acceptance criteria

- Global tokens cover colors, spacing, typography scale, and radii, with no hard-coded component colors.
- Reusable buttons include primary outlined, secondary text, and ghost variants; forms include inputs and textareas; cards include property and blog specimens; status badges and navigation are included.
- `/design-system` visibly renders each token and component variant, and adapts to narrow viewports.
- No production pages are built or modified, no gradients or emoji are used, and icons come from Lucide React.
- TypeScript, ESLint, and production build pass.
- Capture a headless Chrome screenshot of `/design-system` and compare the result to the supplied reference for palette, typography, spacing, and overall editorial character.

## Manual test steps

1. Start the development server and open `/design-system` at desktop and mobile viewport widths.
2. Confirm all token swatches, type samples, spacing/radius samples, component variants, and status examples are visible.
3. Check keyboard focus on navigation links and form controls, and verify labels and controls are associated.
4. Capture a headless Chrome screenshot and compare its palette, typography, density, and whitespace to `design/editorial-reference.png`.
5. Confirm the existing `/` route remains unchanged.
