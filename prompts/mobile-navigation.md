# Mobile navigation

## Goal

Replace the public site's wrapping mobile navigation with an accessible hamburger menu that opens and closes smoothly, while documenting the responsive pattern in the design system. This starts the broader mobile-responsiveness work; other page layouts stay out of scope.

## Skills read

- `build-editorial-ui`
- `write-rhema-copy`

## Files inspected

- `AGENTS.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/specs/phase11-seo-jsonld.md`
- `docs/progress.md`
- `src/components/site/site-header.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `src/components/ui/navigation.tsx`
- `package.json`
- `design/editorial-reference.png`

The suggested `context/ui-registry.md` was not present. Existing public navigation is in `SiteHeader`; the design-system route has a separate section navigation. The worktree already contains unrelated and in-progress changes, including edits to `AGENTS.md`, `docs/progress.md`, `src/app/globals.css`, and `src/app/design-system/page.tsx`. Those changes must be preserved and integrated.

## Decisions and sources

- Keep all current public routes and labels. Source: `src/components/site/site-header.tsx` and Phase 02.
- Use the existing `760px` mobile breakpoint rather than introducing a new breakpoint. Source: `src/app/globals.css`.
- Keep the desktop/tablet navigation intact; show a compact menu control and a full-width expandable navigation panel on mobile.
- Use existing color, spacing, type, border, and focus tokens. Source: `src/app/globals.css` and the existing design-system showcase. Do not add hard-coded colors.
- Use the installed `lucide-react` icons for the menu control. Source: `package.json` and the project UI rules.
- Use the existing `160ms` interaction timing as the starting point for the open/close transition, and honor reduced-motion preferences. Source: existing CSS transitions in `src/app/globals.css`.
- The mobile panel will close on Escape and after following a navigation link. The control will expose its expanded state and the panel relationship to assistive technology.
- Add a responsive-navigation specimen and guidance to `/design-system`, reusing the existing design language and preserving the current in-progress showcase changes.

## Files to touch

- `src/components/site/site-header.tsx` or a small client component it composes for menu state.
- `src/components/site/mobile-site-navigation.tsx` for isolated client-side menu interaction.
- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `docs/progress.md`
- `AGENTS.md` under `## Known issues`

Read the relevant installed Next.js guide under `node_modules/next/dist/docs/` before implementation, as required by the repository instructions.

## Acceptance criteria

- The mobile header stays compact when the menu is closed.
- The menu opens and closes with a restrained, smooth transition and no horizontal overflow.
- Existing navigation routes and desktop/tablet behavior remain intact.
- The menu is keyboard-operable, has a visible focus state, exposes its expanded/collapsed state, closes on Escape and link selection, and respects reduced-motion preferences.
- The design-system page documents and demonstrates the responsive navigation pattern.
- Existing worktree changes are not reverted or overwritten.
- TypeScript, lint, and production build pass.
- Browser review verifies the header at 375px, 768px, and 1440px, including keyboard interaction on mobile.

## Manual test steps

1. At 375px, verify the brand and menu button fit on one row with the menu closed.
2. Open and close the menu using the button; check the transition and ensure the content below does not overflow horizontally.
3. Use Tab, Enter/Space, and Escape; confirm focus visibility, correct expanded state, Escape closing, and focus restoration to the menu button.
4. Follow a menu link and confirm it navigates to the intended public route and closes the menu.
5. At 768px and 1440px, confirm the expected navigation presentation and that every existing route remains reachable.
6. Enable reduced motion and confirm opening/closing does not animate.
7. Review the responsive-navigation entry on `/design-system`.
