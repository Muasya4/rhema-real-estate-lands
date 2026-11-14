# Design System V2 Preview Plan

## Goal

Prepare a separate, review-only design-system showcase for Rhema Real Estates, inspired by the uploaded Events District reference and the owner's black-and-gold brand direction. Keep the current design system and all production pages unchanged. Do not start implementation until the owner approves this plan.

## Skills read

- `build-editorial-ui`: inspected the current showcase and design-system guidance. Its original editorial reference remains in force for the current system; this preview is a separate, owner-requested visual direction.

## Files inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `design/events-district-1.png`
- `design/rhema-real-estate.vercel.app_.png`
- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `prompts/design-system.md`
- `docs/progress.md`
- Live Events District homepage at `https://www.eventsdistrict.co.ke`

## Design direction and decisions

- **Palette:** use near-black and charcoal as the primary surfaces, warm white for readable text, and gold as a restrained accent for actions, dividers, and selected details. The owner specified black and gold; the uploaded screenshot and live reference show a predominantly dark interface with bright gold accents. Exact hex values are intentionally undecided because no official brand color values were supplied.
- **Typography:** contrast a confident, large display face with a restrained, readable sans-serif for navigation and supporting details. Use selective italic emphasis only if it remains legible and matches the reference's restrained display treatment.
- **Composition:** use generous dark negative space, fine borders, clear image-led feature areas, and compact information cards. Avoid gradients, glass effects, and decorative icon tiles.
- **Rhema-specific content:** demonstrate a land feature, portfolio/property card, regions, inquiry action, buttons, fields, and status markers. Do not reproduce Events District's event-specific page sections, copy, branding, or imagery. Do not invent property facts or prices.
- **Content constraints:** retain the repository's plain-English voice and avoid eyebrow tags, even though the reference uses small section labels.
- **Isolation:** build this as a new route and route-local CSS module. Do not edit `globals.css`, the current `/design-system` route, shared UI components, the site shell, or production pages. Avoid importing shared components whose visual styling comes from the existing system.
- **Review boundary:** this proposal requests approval only for the isolated preview. Any adoption or changes to the broader site will require a separate review and explicit approval.

## Files to touch after approval

- `next.config.ts`: limit the custom Tailwind Turbopack loader to the global stylesheet so `.module.css` receives native CSS Module processing.
- `src/app/design-system-v2/page.tsx`: isolated visual showcase.
- `src/app/design-system-v2/design-system-v2.module.css`: route-scoped styles and proposed tokens.
- `docs/progress.md`: record preview status and any review findings after implementation.

## Acceptance criteria

- The new route presents the proposed black-and-gold design direction without changing the existing design system or production pages.
- The showcase includes readable color swatches, typography, spacing or surface examples, and representative Rhema interface elements.
- No invented property prices or unverified property details appear.
- The page remains accessible and usable at 375px, 768px, and 1440px, with visible focus states and no horizontal overflow.
- Review the rendered preview against the uploaded reference and document requested changes before any broader adoption.

## Manual test steps

1. Open `/design-system-v2` in the local development environment.
2. Review the palette, typography, buttons, property specimen, status markers, and inquiry controls.
3. Check keyboard navigation and visible focus states.
4. Review the route at 375px, 768px, and 1440px and check for horizontal overflow.
5. Confirm `/design-system` and production pages have no visual or source changes attributable to this preview.

## Validation after approval

- Run the repository type check, lint, and production build.
- Capture and review browser screenshots of the preview at the three required viewport widths.
- Do not deploy or apply this system to production pages as part of the preview.
