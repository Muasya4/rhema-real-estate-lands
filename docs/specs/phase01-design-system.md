# Phase 01: Design System

## Status

Implemented. The current design foundation is in `src/app/globals.css`, reusable UI components are in `src/components/ui/`, and the showcase is at `/design-system`.

## Goal

Establish the shared visual language and accessible interface patterns for Rhema Real Estates.

## Scope

- Editorial typography, color, spacing, radii, and elevation tokens.
- Shared navigation, buttons, fields, status badges, and property/journal card patterns.
- Responsive component showcase for visual review.
- Align all public pages to `design/editorial-reference.png`.

## Requirements

- Use CSS tokens for colors and design values. Do not introduce page-specific hard-coded palette colors.
- Use Lucide React for icons. Do not use emoji, gradients, glass effects, or icon-in-a-box layouts.
- Keep land imagery prominent, typography quiet, and status/price details subordinate.
- Provide visible keyboard focus and semantic labels for controls.
- Keep the system responsive and reusable. The showcase is a reference page, not production inventory.

## Acceptance criteria

- Design tokens and shared patterns are documented and visible on `/design-system`.
- Existing public-facing UI can use the tokens without duplicating palette or component rules.
- Showcase remains usable on mobile and desktop with no horizontal overflow.
- TypeScript, lint, and production build pass.
- Desktop and mobile screenshots are reviewed against `design/editorial-reference.png`.

## Dependencies

None.

## Validation

Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Review the showcase at mobile and desktop widths.
