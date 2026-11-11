# Phase 04: Property Listing

## Status

Planned. The current home page lists service areas but has no property data source or portfolio route.

## Goal

Build a server-rendered, curated portfolio page using real property records from Supabase.

## Scope

- `/properties` portfolio index.
- Editorial property cards using the shared card and status patterns.
- Link each record to its property detail route.
- Optional region filtering only if it can be implemented from canonical schema values and has a clear mobile interaction.

## Requirements

- Fetch listing data on the server and use the database/RLS as the visibility boundary.
- Show only properties approved for public display under the agreed publication policy.
- Render only fields present in the record. Omit unknown plot size and show `Price on request` when price is not supplied.
- Display status as a small marker, not a banner. Do not imply availability from missing status data.
- Use actual property images from the configured public image source. Keep a neutral local fallback for missing imagery.
- Do not create mock records in production, infer property relationships from names, or add infinite scrolling.
- Provide clear empty and error states. Do not turn failed data reads into success-shaped empty results without reporting the failure.
- Ensure cards have descriptive links and images have meaningful alt text.

## Acceptance criteria

- `/properties` renders a finite editorial selection of real, public records.
- Every card links to the matching slug route and displays accurate location, title, status, and available price/size data.
- No invented property data is displayed.
- Empty results and data failures are distinguishable.
- Layout and optional filters work at mobile, tablet, and desktop widths.
- TypeScript, lint, build, and data-access tests pass.

## Dependencies

- Phase 02 public layout shell.
- Phase 03 schema, RLS, and a configured data access layer.
- Phase 05 property detail route for card destinations.

## Validation

Test available, reserved, sold, incomplete, empty, and error data cases. Confirm RLS visibility and responsive screenshots.
