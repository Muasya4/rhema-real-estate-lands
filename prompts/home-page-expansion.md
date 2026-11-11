# Home Page Expansion Plan

## Goal

Expand the home page into a substantial editorial entry point for a site intended to have at least five pages. Keep the current implementation focused on `/`, while making room in the site structure for a future portfolio, regions, journal, and private-enquiry pages.

## Skills and documentation read

- `build-editorial-ui`: reuse the design system and supplied reference; verify mobile, tablet, desktop, lint, and build.
- `write-rhema-copy`: write concise Rhema-specific copy and avoid marketing clichés.
- Next.js 16.4.5 guidance read during the existing page implementation: layouts and pages, linking and navigation, server and client components, global CSS, local images, and metadata.
- No current phase spec exists: `docs/specs/` is absent.
- No UI registry exists: `context/ui-registry.md` is absent.

## Files inspected

- `AGENTS.md`
- `design/editorial-reference.png`
- `docs/product.md`
- `docs/progress.md`
- `prompts/home-page.md`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/ui/cards.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/navigation.tsx`
- `public/land-placeholder.svg`
- `package.json`
- `next.config.ts`
- `tsconfig.json`

## Decisions and sources

- Treat the supplied editorial reference as the visual source of truth and retain the existing token palette, typography, spacing, and interaction patterns from `globals.css`.
- Increase page depth with a portfolio introduction, a more visual regional directory, a short agency introduction, a journal preview, and a private-enquiry close.
- Use only the service areas in `AGENTS.md`: Nairobi Metropolitan Area, Ruiru, Kamakis, Thika Road corridor, Kiambu County, Machakos, Kajiado, Kagio, Kutus, Sagana, and Baricho.
- Use only `0711634163` from `docs/product.md` for call and WhatsApp actions.
- Do not show land cards that resemble real inventory: no property records, availability, plot sizes, prices, imagery, or descriptions exist in the repository.
- Label journal preview cards as planned topics, not published articles. The user selected clearly marked topic placeholders because no blog posts or Supabase helpers exist in the repository.
- Keep actions linked to existing home-page sections or the supplied contact number. Do not send visitors to pages that have not been built.
- Keep this change limited to the home page; later page targets can be `/properties`, `/regions`, `/journal`, and `/contact`, in addition to `/`. Routes and content for those pages are not part of this change.
- Ensure responsive layouts are intentionally composed at mobile (up to 480px), tablet (481px to 1024px), and desktop widths using existing tokens.
- Update `docs/progress.md` to reflect the expanded home page and testing.

## Files to touch

- `src/app/page.tsx`: add the portfolio introduction, richer regions, agency section, labeled journal topics, and enquiry CTA.
- `src/app/globals.css`: add token-based styles and mobile/tablet/desktop breakpoints for the expanded sections.
- `docs/progress.md`: record the updated page and responsive validation.

## Acceptance criteria

- The home page feels like a complete editorial landing page, not a short placeholder, and adds distinct, useful sections for land, service areas, the agency, the journal, and enquiries.
- Journal cards are clearly labeled planned topics, not presented as published content.
- No invented property inventory, prices, sizes, statuses, article dates, or business claims appear.
- All service-area names and contact details match the provided project data.
- All links point to real page sections or the supplied phone number.
- Layouts remain readable and deliberately composed at mobile (390px), tablet (768px and 1024px), and desktop (1440px), without horizontal overflow.
- Existing token usage and editorial direction are preserved. No hard-coded colors, gradients, emojis, em dashes, eyebrow labels, or icon-in-a-box layouts are introduced.
- TypeScript, lint, and production build pass; inspect browser screenshots on mobile, tablet, and desktop.

## Manual test steps

1. Open `/` and compare the expanded hierarchy, image treatment, typography, palette, and whitespace to `design/editorial-reference.png`.
2. Check that the portfolio section does not imply a specific active listing or invented plot detail.
3. Check that each journal card is visibly marked as a planned topic and has no dead article link.
4. Follow all navigation and action links; confirm they lead to existing sections or call/WhatsApp.
5. Inspect the page at 390px, 768px, 1024px, and 1440px. Confirm that section grids adapt intentionally and no horizontal overflow appears.
6. Confirm the local temporary land image still loads.
