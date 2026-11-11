# Phase 05: Property Detail

## Status

Implemented. The slug-based detail route, published-record lookup, gallery, metadata, inquiry association, and not-found UI are in place. The development database has no published property records, so the found state has been verified with mock data tests rather than a live listing.

Accepted limitation: with the app's Next.js Cache Components and partial prerendering, an unknown slug renders the not-found UI with `noindex` but can return HTTP 200 because the shell streams before the lookup finishes. The user chose to retain streaming rather than change the broader rendering strategy.

## Goal

Present one real land holding as an editorial detail page and provide a direct private inquiry path.

## Scope

- Slug-based property detail route.
- Server-side property lookup and route metadata.
- Property image gallery or ordered image presentation.
- Location, description, plot size, price, status, and inquiry link.
- Not-found behavior for unknown or non-public slugs.

## Requirements

- Resolve the record by its unique slug. Do not infer identity or relationships from title text.
- Fetch and render on the server, respecting RLS and the public visibility policy from Phase 03.
- Show only known property facts. Omit missing location or plot size; use `Price on request` when no price is supplied.
- Render status as a small marker, not a banner.
- Use accessible image descriptions and a responsive image layout. Missing images must not break the page.
- Provide an inquiry action associated with the property ID, not a name-based lookup.
- Return a proper not-found response for absent, unpublished, or otherwise non-public records.

## Acceptance criteria

- A public property slug renders only the matching real database record.
- Unknown and non-public slugs do not expose private record data.
- Displayed fields match the database record, with missing values handled as specified.
- The inquiry action carries the correct property ID into the inquiry flow.
- Page metadata is specific to the property and does not contain fabricated claims.
- Mobile, tablet, and desktop layouts are usable; tests cover found and not-found cases.

## Dependencies

- Phase 02 public layout shell.
- Phase 03 schema, RLS, and data access.
- Phase 07 inquiry flow for the contextual inquiry action.

## Validation

Test real public, unknown, non-public, and incomplete property records. Verify accessible images, inquiry association, metadata, and responsive layout.
