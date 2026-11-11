# Phase 02: Layout Shell Implementation Plan

## Goal

Implement Phase 02 as a shared, accessible public-site shell with responsive navigation and working public routes, without presenting fictional listings, articles, or inquiry records.

## Skills and documentation to use

- `build-editorial-ui`: follow `design/editorial-reference.png`, use existing tokens, and validate responsive layouts.
- `write-rhema-copy`: keep all new customer-facing copy specific to Rhema and supported by project facts.
- Next.js 16.4.5 documentation: read the installed App Router guides for route groups, layouts, linking/navigation, metadata, and CSS before editing code.
- The Supabase skill is not needed for this phase because no database integration or schema work is planned.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/specs/phase01-design-system.md`
- `docs/product.md`
- `docs/progress.md`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/ui/navigation.tsx`
- `prompts/home-page-expansion.md`
- `package.json`
- App and component file listings
- `design/editorial-reference.png` (identified as the visual reference; compare during implementation review)

`context/ui-registry.md` and the `context/` directory are absent. Existing reusable navigation patterns are in `src/components/ui/navigation.tsx`; the home page currently has its own public header and footer.

## Decisions and sources

- Use the Phase 01 tokens and the editorial reference for all shell styling. Do not add a new palette or invent design tokens.
- Put public routes in a Next.js route group, `(public)`, so the shared public shell does not automatically wrap future admin routes. Keep the existing root layout responsible for `<html>`, `<body>`, and default metadata.
- Move the existing home page into the public route group without changing its factual content. Update its navigation and internal calls to action to target implemented public routes where appropriate.
- Build shared header and footer components. Use a native disclosure (`details`/`summary`) for the narrow-screen menu so it remains keyboard-operable without client-side state.
- Implement `/properties`, `/regions`, `/journal`, and `/contact` as honest route entry points:
  - Properties and journal show clear empty states because the repository has no property records, published articles, or configured data access.
  - Regions list only the service areas in `AGENTS.md`.
  - Contact offers only the documented phone and WhatsApp paths, using `0711634163` from `docs/product.md`; do not invent an email address or add a form before Phase 07.
- Do not add property or journal detail handlers in this phase. Their data-dependent behavior belongs to Phases 05 and 06. No navigation item will link to those routes until implemented.
- Keep `/design-system` outside the public route group because it is a component showcase, not a public customer page.
- Use a title template and accurate site-wide default description without setting `metadataBase`, since no production origin is documented.
- Mark Phase 02 implemented in its spec and record changes, validation, and any remaining blockers in `docs/progress.md`.

## Approval decision

Recommended approach: create all four named route entry points now, with factual region content and explicit empty states for unavailable properties and articles. This satisfies Phase 02's working-navigation requirement while leaving data-backed functionality to its dependent phases.

Alternative: create only the shared shell and keep links to properties, regions, journal, and contact hidden until those later phases. This avoids placeholder routes but does not establish the public route structure described by Phase 02.

## Files to touch

- `src/app/layout.tsx`: preserve root document structure and set site-wide metadata defaults/template.
- `src/app/page.tsx`: move the existing homepage into `src/app/(public)/page.tsx` without unrelated content changes.
- `src/app/(public)/layout.tsx`: compose the shared public header, page content, and footer.
- `src/app/(public)/page.tsx`: retain the current home page, adapting its links to the real routes.
- `src/app/(public)/properties/page.tsx`: add the portfolio route and an accurate no-listings state.
- `src/app/(public)/regions/page.tsx`: present the documented service-area names.
- `src/app/(public)/journal/page.tsx`: add the journal route and an accurate no-published-articles state.
- `src/app/(public)/contact/page.tsx`: show the documented call and WhatsApp actions.
- `src/components/site/site-header.tsx`: create shared desktop and mobile public navigation.
- `src/components/site/site-footer.tsx`: create shared footer links and the documented phone contact.
- `src/app/globals.css`: add token-based shared-shell and route styles with mobile, tablet, and desktop behavior.
- `docs/specs/phase02-layout-shell.md`: record completed status and implementation details.
- `docs/progress.md`: record changes, tests, and known issues.

## Acceptance criteria

- Home, properties, regions, journal, and contact render within one responsive public shell.
- Public navigation targets only implemented routes. Keyboard users can reach and operate every link and the mobile disclosure.
- Admin routes remain outside the public shell by route-group structure.
- No fictional property records, article content, or unsupported contact details appear.
- The properties and journal empty states are distinguishable from data-fetch failures; no data fetch is introduced in this phase.
- The existing `/design-system` showcase remains reachable and unchanged in behavior.
- No horizontal overflow; layouts are reviewed at 375px, 768px, and 1440px.
- TypeScript, lint, and production build pass.

## Manual test steps

1. Open `/`, `/properties`, `/regions`, `/journal`, `/contact`, and `/design-system`; confirm each route renders and the public routes share the header and footer.
2. Follow every public navigation and footer link, including the menu disclosure at narrow widths.
3. Use keyboard-only navigation to open and close the mobile menu and activate all links. Confirm focus is visible.
4. Confirm Regions contains only documented service areas; Contact uses only `0711634163`; Properties and Journal clearly show no current records without implying a fetch failure.
5. Review screenshots and horizontal overflow at 375px, 768px, and 1440px.
6. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
