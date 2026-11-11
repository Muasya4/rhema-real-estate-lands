# Phase 02: Layout Shell

## Status

Implemented. Public pages use a shared responsive header and footer. The design-system showcase remains outside the public shell.

## Goal

Create a consistent, accessible shell for the public Rhema website and establish navigation for the complete public site.

## Scope

- Shared public header, navigation, and footer.
- Responsive desktop, tablet, and mobile navigation.
- Public route structure for home, portfolio, regions, journal, property detail, and contact/inquiry.
- Site-wide metadata defaults and shared layout behavior.
- Keep admin navigation separate from the public shell.

## Requirements

- Use `/` for the home page, `/properties` for the portfolio, `/regions` for service areas, `/journal` for published articles, and `/contact` for general inquiries. Property and journal detail routes use stable slugs.
- Navigation items must point only to implemented routes or valid in-page anchors.
- Use the design-system tokens and shared UI patterns from Phase 01.
- Keep navigation keyboard-accessible, with a visible focus state and a clear mobile layout.
- Avoid adding client-side state unless the navigation interaction requires it.
- Include the phone contact `0711634163` from `docs/product.md`; do not invent other contact details.

## Acceptance criteria

- Public pages share one responsive header and footer.
- Navigation works at mobile, tablet, and desktop breakpoints.
- No public navigation points to a missing route.
- Admin routes do not inherit public access assumptions or replace server-side authorization.
- TypeScript, lint, and production build pass; browser review shows no horizontal overflow.

## Dependencies

- Phase 01 design system.

## Validation

Run TypeScript, lint, and production build. Check keyboard navigation and route links at mobile, tablet, and desktop widths.

## Implementation notes

- The `(public)` route group contains `/`, `/properties`, `/regions`, `/journal`, and `/contact`. The route group is omitted from the URLs.
- The root layout retains the document elements and metadata defaults. The public route-group layout composes the shared header and footer. Future admin routes can remain outside this group.
- Properties and Journal render clear no-records states because no property data source or published article records exist yet. Regions lists only the supplied service areas. Contact uses the documented phone and WhatsApp number.
- Property and journal detail routes remain deferred to Phases 05 and 06. No navigation links point to those routes yet.
- The public navigation stays visible and wraps into rows on narrow viewports rather than introducing client-side menu state.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass. The production build reports the expected static routes.
- An HTTP request to `/regions` returned 200. Browser automation timed out during review, and a sequential local development-server route check stalled. Responsive screenshots and keyboard interaction therefore still need a manual browser review.
