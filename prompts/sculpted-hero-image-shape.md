# Sculpted Homepage Hero Image

## Status

Approved and implemented. Lint, TypeScript, all 142 tests, and the production build passed. Responsive screenshots and an interactive admin upload-preview check remain pending because browser automation timed out connecting over CDP.

## Goal

Replace the homepage hero's simple oval-like image treatment with a more dramatic, asymmetrical, sculpted silhouette inspired by the attached reference. Reuse the exact shape in the admin hero-image preview so an admin can see the crop before saving. Remove the divider line above the hero image caption.

## Skills read

- `build-editorial-ui`: follow existing token, layout, and responsive patterns.
- `write-rhema-copy`: keep any admin guidance short and direct.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `src/app/(public)/page.tsx`
- `src/app/globals.css`
- `src/components/admin/site-content/content-manager.tsx`
- `src/app/admin/content/page.tsx`
- `src/lib/site-content/defaults.ts`
- `prompts/content-management-scope-revision.md`
- Next.js 16.4.5 CSS guide at `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`
- The attached reference image, showing asymmetrical, flowing silhouettes.
- No `context/ui-registry.md` exists.

## Decisions and sources

- **Silhouette:** use one shared, responsive SVG clip-path with a custom Bézier outline. Its asymmetrical bulges, narrower transitions, and offset gold contour will follow the supplied reference more closely than a large rounded ellipse. Keep the image itself photographic; do not add decorative scene artwork.
- **Reuse:** make the shape reusable between the public hero and admin hero-image preview. The image preview updates from the existing local object URL before the admin saves.
- **Palette:** use existing semantic CSS variables from `globals.css`, including the current gold accent and surface tokens. Do not add hard-coded color values.
- **Caption:** remove the top border only from the homepage hero caption. Do not alter the portfolio image caption or other captions.
- **Scope:** do not change the homepage hero sizing, copy, admin upload/persistence behavior, portfolio image, or other routes.

## Files to touch after approval

- `src/components/ui/hero-image-shape.tsx`: reusable masked image wrapper with the custom silhouette and decorative contour.
- `src/app/(public)/page.tsx`: wrap the homepage hero image in the shared shape component.
- `src/components/admin/site-content/content-manager.tsx`: apply the same shape only to the hero image preview; preserve object URL preview behavior.
- `src/app/globals.css`: define responsive shape, contour, and caption styles using design tokens.
- `docs/progress.md`: record implementation, checks, and any visual review limitations.
- This plan: update status and implementation results.

## Acceptance criteria

- The public hero image has a clearly asymmetric, sculpted silhouette inspired by the supplied image, not a simple oval.
- The admin's hero-image preview uses the same silhouette for both the saved image and a newly selected local image.
- Other admin image previews and the homepage portfolio image remain unchanged.
- The divider above the hero caption is removed without changing other caption dividers.
- TypeScript, lint, production build, and `git diff --check` pass.
- Browser review checks the hero and admin preview at 375px, 768px, and 1440px when browser automation is available.

## Manual test steps

1. Review the homepage hero silhouette at 375px, 768px, and 1440px. Confirm the full image and contour scale without horizontal overflow.
2. Open `/admin/content`, select a different hero image, and confirm the local preview uses the same silhouette before saving.
3. Confirm the portfolio image, portfolio caption, and other content-image previews retain their current rectangular presentation.
4. Confirm the line above the homepage hero caption is gone and the portfolio caption remains unchanged.
5. Confirm selecting no new image or editing unrelated fields preserves existing behavior.

## Implementation and validation results

- Added a reusable SVG-clipped silhouette with an asymmetrical Bézier edge and two token-based gold contours.
- Applied the same component to the public homepage hero and the admin hero-image preview. The existing object-URL preview updates locally before saving.
- Removed the border above the homepage hero caption only. Portfolio and other image previews remain rectangular.
- `npx tsc --noEmit`, `npm run lint`, and `npm test` passed; all 142 tests passed.
- `SITE_URL=https://www.rhemarealestates.com npm run build` passed using a temporary isolated output directory. The temporary directory and generated `tsconfig.json` changes were removed.
- `git diff --check` passed.
- A desktop homepage screenshot showed the new silhouette and the caption without a divider. Browser automation timed out when navigating to `/admin/content`; responsive screenshots at 375px, 768px, and 1440px and an interactive upload-preview check remain unverified.
