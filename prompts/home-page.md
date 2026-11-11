# Home Page Implementation Plan

## Goal

Replace the starter screen at `/` with Rhema Real Estates' first public-facing home page. Match the supplied editorial reference and existing design tokens, use clearly temporary land-image placeholders, and do not invent property records or claims.

## Skills and documentation read

- `build-editorial-ui`: use the existing design system and editorial reference; verify responsive behavior, lint, and build.
- `write-rhema-copy`: use concise, Rhema-specific copy and avoid marketing clichés.
- Next.js 16.4.5 App Router guides: layouts and pages, linking and navigating, server and client components, global CSS, images, and metadata.
- No current phase spec exists: `docs/specs/` is absent.
- No UI registry exists in the repository: `context/ui-registry.md` is absent.

## Files inspected

- `AGENTS.md`
- `design/editorial-reference.png`
- `docs/product.md`
- `docs/progress.md`
- `prompts/design-system.md`
- `prompts/design-system-color-accents.md`
- `prompts/design-system-olive-text-and-nav.md`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/design-system/page.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/cards.tsx`
- `src/components/ui/fields.tsx`
- `src/components/ui/navigation.tsx`
- `src/components/ui/status-badge.tsx`
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `README.md`
- `public/`

## Decisions and sources

- Use the supplied `design/editorial-reference.png` for page hierarchy, image proportions, spacing, restrained labels, and typography.
- Use only the existing CSS tokens in `src/app/globals.css` for page colors, typography, spacing, and radii.
- Keep the page a server-rendered App Router page. The home page needs no client-side state or browser APIs.
- Use only region names supplied in `AGENTS.md`: Nairobi Metropolitan Area, Ruiru, Kamakis, Thika Road corridor, Kiambu County, Machakos, Kajiado, Kagio, Kutus, Sagana, and Baricho.
- Use `0711634163` for call and WhatsApp contact links, as specified in `docs/product.md`.
- Do not show invented plots, prices, plot sizes, availability, blog posts, or property claims. The repository has no Supabase integration or property/blog data helpers yet.
- Add clearly temporary, local land-image placeholder artwork under `public/`, so the page does not depend on third-party image URLs. Keep it visibly identifiable as placeholder content and easy to replace.
- Keep navigation and actions pointed at sections that exist on the home page or the provided contact number. Do not link to unfinished routes.
- Update the home page metadata in `src/app/layout.tsx` using only the agency and region facts provided in `AGENTS.md` and `docs/product.md`.
- Extend the existing global stylesheet with home-page-scoped, responsive styles. Reuse existing button styles where appropriate; do not reuse design-system specimen components as production content.
- Record the completed page and verification in `docs/progress.md`.

## Files to touch

- `src/app/page.tsx`: replace the Next.js starter content with the home page.
- `src/app/globals.css`: add token-based, responsive home-page styles.
- `src/app/layout.tsx`: make the site metadata specific to Rhema's stated service and regions.
- `public/land-placeholder.svg`: add local, temporary placeholder artwork for land imagery.
- `docs/progress.md`: record the delivered home page and validation.

## Acceptance criteria

- `/` presents an editorial, responsive home page that follows the supplied reference and existing design tokens.
- Land imagery is present as temporary, locally served placeholder artwork that can be replaced without editing third-party image configuration.
- Rhema's stated service areas and phone contact are accurate.
- No unsupported property data, prices, plot sizes, statuses, blog content, or company claims are presented.
- Navigation and calls to action lead to real home-page sections or the supplied phone number.
- No gradients, hard-coded design-system colors, emoji, em dashes, eyebrow labels, or icon-in-a-box layouts are introduced.
- TypeScript, lint, and production build pass; desktop, tablet, and mobile layouts are visually checked.

## Manual test steps

1. Open `/` and compare the page structure, imagery balance, palette, typography, and whitespace to `design/editorial-reference.png`.
2. Check desktop, tablet, and mobile widths for readable navigation, intact image proportions, and no horizontal overflow.
3. Follow each navigation link and verify it reaches an existing section; verify call and WhatsApp links use `0711634163`.
4. Confirm placeholder artwork loads locally and is clearly temporary.
5. Confirm the page contains no made-up property, pricing, availability, or journal data.
