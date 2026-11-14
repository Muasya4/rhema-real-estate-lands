# Public Site Content Management: Scope Revision

## Status

Approved scope: all public page editorial sections and homepage imagery. This supersedes the broad editable-copy scope in `content-management.md`.

## Goal

Make public page sections straightforward for a non-technical admin to update without allowing edits to navigation, controls, destinations, or system behavior. Let admins replace fixed homepage imagery and restore each section independently.

## Skills read

- `build-editorial-ui`: reuse the existing design system and responsive admin patterns.
- `write-rhema-copy`: keep editable copy specific to Rhema.
- `supabase`: follow current Storage, Data API, and RLS guidance.
- `supabase-postgres-best-practices`: retain least-privilege RLS and safe schema patterns.

## Files and resources inspected

- `AGENTS.md`, `docs/specs/phase01-design-system.md`, and `docs/specs/phase02-layout-shell.md`.
- Existing broad-scope plan: `prompts/content-management.md`.
- Content keys and groups: `src/lib/site-content/defaults.ts`.
- Content validation and section allowlisting: `src/lib/site-content/model.ts`.
- Admin editor: `src/components/admin/site-content/content-manager.tsx`.
- Admin save/reset actions: `src/lib/admin/site-content/actions.ts`.
- Public content reader: `src/lib/site-content/data.ts`.
- Homepage sections and current placeholder images: `src/app/(public)/page.tsx`.
- About page and its record-backed leadership image: `src/app/(public)/about/page.tsx`.
- Existing admin image upload and cleanup patterns: `src/lib/admin/about/actions.ts`, `src/lib/admin/journal/actions.ts`, and `src/lib/storage/image-validation.ts`.
- Current public image bucket and its RLS tests: `supabase/tests/database/content_schema_test.sql`.
- No `context/ui-registry.md` exists. Reuse current admin form patterns and `src/app/globals.css` tokens.

## Decisions and sources

- **Remove shared-shell editing:** Header/brand, navigation labels, footer wording, skip/menu accessibility labels, and default site metadata stay code-owned. In particular, link labels cannot be changed independently of their route destinations.
- **Keep actions and system behavior code-owned:** Button and link labels, route destinations, phone/WhatsApp/email destinations, form labels and validation, loading/error/empty states, status wording, metadata, structured data, and accessibility behavior are not editable here.
- **Editable public copy:** Only page-section editorial content is editable: page/section headings and their descriptive paragraphs. Property and Journal record content, region names, and the CEO profile remain in their respective existing editors.
- **Homepage imagery:** Add admin image replacement for the existing home hero and portfolio-section images. Keep image alt text and visible image caption fields with their corresponding image section so replacing an image does not leave a misleading description. Other record-owned imagery remains in its existing editor.
- **Section reset only:** Each page section restores its own text and image defaults. Remove the site-wide reset control.
- **Keep destinations and layout fixed:** No free-form URLs, links, CSS, layout, or markup inputs. Image selection uses a validated upload and a generated Storage path, not an admin-entered URL.
- **Image constraints:** Reuse the existing upload validator: JPEG, PNG, or WebP, max 5 MiB (`src/lib/storage/image-validation.ts`). Use the existing `property-images` bucket and its admin write/public read policy.
- **Persistence:** Use the existing `site_content` table for allowlisted editorial text and generated image paths; it stores text values and has admin-only mutation RLS. No new database table or grant is expected. Public reads must ignore any legacy overrides for fields now deemed non-editable, so old navigation/footer edits cannot remain visible.
- **Restore behavior:** Reset removes only the selected section's editable override rows and restores that section's version-controlled text and original local image. Do not remove unrelated records or media.
- **Source of values:** Preserve existing approved page-section copy from `src/lib/site-content/defaults.ts`. Keep the current homepage image fallback `/land-placeholder.svg` and its existing 1200x1000 display dimensions from `src/app/(public)/page.tsx`; do not invent replacement imagery or aspect ratios.

## Files to touch after approval

- Narrow the editable field registry and introduce home-image fields in `src/lib/site-content/defaults.ts`.
- Update `src/lib/site-content/model.ts` and `src/lib/site-content/data.ts` to allow only approved page-section overrides and safely ignore legacy non-editable overrides.
- Extend `src/lib/admin/site-content/actions.ts` for validated section image uploads and section-scoped restoration, reusing existing admin upload helpers and error-reporting conventions.
- Update `src/components/admin/site-content/content-manager.tsx` with non-technical labels, image preview/upload controls, and section-only restore controls. Remove the all-site reset.
- Update `src/app/(public)/page.tsx` to render the uploaded hero and portfolio images through the existing public Storage URL pattern.
- Review all public content consumers and stop applying database overrides to excluded shared, form, system-state, metadata, and action-label fields.
- Update affected phase specs, `docs/progress.md`, `AGENTS.md` known issues, tests, and the existing content-management plan after approval.
- No migration change is planned if the existing `site_content` migration is already applied. If it is still pending, revise it before it is run; do not apply any hosted migration as part of this work.

## Acceptance criteria

- No header, navigation, footer, button/link label, metadata, form/system message, destination, or accessibility/security behavior is editable in this editor.
- Admins can update only page/section headings and descriptive copy in the approved sections.
- Admins can replace the homepage hero and portfolio images with a preview and useful validation feedback.
- Replacing an image requires its corresponding alt text to be reviewed or updated.
- Saving a section updates only that section and publishes the change after cache invalidation.
- Restoring a section resets only its editable copy and image to defaults.
- Legacy database overrides for excluded fields do not affect the public site.
- Storage upload, RLS authorization, validation failures, save failures, and reset failures are covered by tests.
- TypeScript, tests, lint, production build, and responsive browser review at 375px, 768px, and 1440px pass.

## Manual test steps

1. Sign in as an admin and confirm the editor shows only approved page-section copy and the homepage image sections.
2. Confirm navigation/footer, buttons, form wording, metadata, and system states have no editable controls.
3. Replace each homepage image with a valid image, update its alt text, save, and verify the public page uses the new image.
4. Try an unsupported image type and an image larger than 5 MiB; verify each is rejected with a clear message.
5. Edit two sections, restore only one, and verify the other remains saved.
6. Confirm old saved nav/footer overrides no longer affect public pages.
7. Test signed-out and non-admin access to save, upload, and restore paths.
8. Review homepage and editor at 375px, 768px, and 1440px.

## Approval record

The user selected `all-editorial-sections`. This approves the recommended editable scope above. Navigation, footer, action labels, forms, metadata, system states, destinations, and record-owned content remain out of scope.

## Decision recorded

The user approved editing page-section headings and descriptive copy across the public pages, plus only the homepage hero and portfolio images. Navigation, footer, actions, forms, metadata, system states, destinations, and record-owned content remain protected.
