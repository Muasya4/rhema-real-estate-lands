# Client-Ready Placeholder Removal

## Status

Approved. Keep the two abstract homepage illustrations, remove placeholder labels, remove unpublished journal teasers, and suppress missing-property-image artwork.

## Goal

Remove visible draft/placeholder copy and mock editorial teasers before the client handoff, without inventing property, image, or journal content.

## Skills read

- `build-editorial-ui`: preserve the current editorial layout and existing design tokens.
- `write-rhema-copy`: use concise, Rhema-specific copy and avoid marketing filler.

## Files and resources inspected

- `AGENTS.md` and `docs/specs/phase01-design-system.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/specs/phase04-property-listing.md`
- `docs/specs/phase06-blog.md`
- `src/lib/site-content/defaults.ts`
- `src/app/(public)/page.tsx`
- `src/components/journal/home-journal.tsx`
- `src/app/(public)/properties/page.tsx`
- `src/lib/properties/data.ts`
- `src/lib/properties/model.ts`
- `src/components/ui/cards.tsx`
- `public/land-placeholder.svg`
- No `context/ui-registry.md` or replacement property photography was found.

## Decisions and sources

- Remove home-page planned journal teaser cards because they are explicitly unpublished topics, not articles. Phase 06 says the homepage should use actual approved posts.
- Remove phrases such as “Photography to be added,” “Temporary land image,” and “Illustration placeholder” from customer-visible output.
- Do not add mock property records or articles. Keep the existing truthful properties and journal empty/error states.
- The project contains only the abstract `/land-placeholder.svg` and no production photos. No new location or property claims will be introduced.
- **Homepage illustration choice:** The user chose to keep the abstract contour illustrations. Describe them accurately as illustrations for screen readers, remove overlay labels and the photography-to-be-added caption, and retain the existing default artwork.
- Missing property photos will not be replaced with invented photography. Suppress the placeholder badge and artwork while retaining the property's text/details.

## Files changed

- `src/lib/site-content/defaults.ts`: remove visible placeholder labels and planned-topic display copy. Retain safe legacy keys so saved database rows remain parseable, but keep them non-editable and unrendered.
- `src/app/(public)/page.tsx`: keep the approved illustrations without label overlays or photography-to-be-added captions.
- `src/components/journal/home-journal.tsx`: show only published journal posts and omit the section when there are no posts.
- `src/lib/properties/data.ts` and `src/lib/properties/model.ts`: stop returning visible placeholder imagery for records that have no image.
- `src/components/ui/cards.tsx` and property detail rendering: suppress missing-image artwork while preserving navigable content.
- `src/app/design-system/page.tsx` and `src/app/globals.css`: remove outdated placeholder labels and unused styles.
- Related tests, `docs/specs/phase04-property-listing.md`, `docs/specs/phase06-blog.md`, `docs/progress.md`, and `AGENTS.md`.

## Acceptance criteria

- No customer-facing “to be added,” “temporary,” “placeholder,” or planned-journal-topic copy remains on public pages.
- No invented property, location, price, photo, article, or article metadata is displayed.
- Homepage journal teasers are actual published posts only.
- Missing property photos do not render placeholder artwork or placeholder badges.
- Existing navigation, property details, real uploaded images, and truthful empty/error states continue to work.
- TypeScript, relevant tests, lint, and production build pass.
- Review the public site at 375px, 768px, and 1440px.

## Manual test steps

1. Open the homepage with no custom content and confirm no draft journal topics or photography notices appear.
2. Verify both abstract illustrations remain without temporary overlays or photography captions.
3. Check property listings and detail pages with records lacking images; confirm their text and links work without placeholder artwork.
4. Confirm uploaded homepage/property images still render normally.
5. Confirm published journal articles still appear and the empty state remains truthful when there are none.
6. Check public pages at 375px, 768px, and 1440px.
