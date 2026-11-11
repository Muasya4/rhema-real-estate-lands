---
name: build-editorial-ui
description: Build or update public-facing pages for Rhema Real Estates using the editorial design system. Use when creating or changing the homepage, property pages, blog pages, or any customer-visible UI.
---

Build or update the following UI: $ARGUMENTS

## Rules

1. Inspect the current implementation and related components first.
2. Search `context/ui-registry.md` for reusable components before creating new ones.
3. Reuse the existing design system tokens from `globals.css`. No hard-coded colors.
4. Use Lucide React icons only. No emojis.
5. No gradients, no glassmorphism, no generic AI patterns.
6. No eyebrow tags. No icon-in-a-box grids.
7. Large editorial imagery, generous whitespace, quiet typography.
8. Price and status are small markers, not banners.
9. Verify responsive behavior at 375px, 768px, and 1440px.
10. Run `npm run build` and `npm run lint`.
11. Summarize what changed and what to review.

## Reference

The target design is in `/design/editorial-reference.png`. Match it.