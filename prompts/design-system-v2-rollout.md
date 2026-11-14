# Design System V2 Site Rollout Plan

## Status

Approved system applied across shared public and admin styles. TypeScript, lint, tests, and an isolated production build pass. Responsive visual review remains pending because browser automation could not connect over CDP.

## Goal

Apply the approved black-and-gold V2 design system across all Rhema public and admin routes, including the shared shell, authentication, forms, property and journal views, admin management, and design-system showcase. Preserve the existing routes, content, authorization, data behavior, and form workflows.

## Skills read

- `build-editorial-ui`: reviewed the current design system, routes, and shared UI.
- `write-rhema-copy`: retain the existing Rhema-specific plain-English copy; no generic marketing copy or eyebrow labels.
- Next.js 16.4.5 docs: App Router page conventions, CSS Modules, Turbopack CSS support, and image usage.

## Files inspected

- `AGENTS.md`
- `docs/specs/phase01-design-system.md`
- `docs/progress.md`
- `prompts/design-system-v2.md`
- `design/events-district-1.png`
- `design/rhema-real-estate.vercel.app_.png`
- `next.config.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/design-system/page.tsx`
- `src/app/design-system-v2/page.tsx`
- `src/app/design-system-v2/design-system-v2.module.css`
- All route page files in `src/app/(public)/` and `src/app/admin/`
- Shared site, admin, and UI components in `src/components/`

No `context/ui-registry.md` exists in the repository. Existing components are reused.

## Decisions and sources

- **Palette:** use near-black `#090908`, charcoal `#11110e`, raised charcoal `#191914`, warm white `#f2efe5`, muted warm gray `#aaa697`, gold `#e4c73e`, muted gold `#9b8332`, and fine rule `#343225`. Source: owner-approved V2 direction, based on the supplied Events District screenshot and explicit black-and-gold brand direction. These are adopted interface values, not a separate official brand specification.
- **Retain prior-system strengths:** preserve editorial serif headings, Geist body text, existing spacing rhythm, accessible focus, restrained component edges, and image-forward presentation. Source: owner's request to carry forward elements they liked in the first system.
- **Scope:** all public routes, all admin and auth routes, the site shell, shared forms/cards/navigation, `/design-system`, and the V2 preview. The previous global system is being superseded by this explicit request to implement V2 across all pages.
- **Visual treatment:** dark backgrounds and panels, legible warm-white foregrounds, gold actions and small accents, thin borders, large display headings, generous spacing, no gradients or glass effects.
- **No content or data changes:** keep route copy, property values, inquiry behavior, permissions, image behavior, and admin actions unchanged.

## Files to touch

- `src/app/globals.css`: map semantic tokens to V2 palette and align shared, public, and admin page styles.
- `src/app/design-system/page.tsx`: update the token inventory and showcase descriptions to match the adopted system.
- `src/app/design-system-v2/design-system-v2.module.css`: consume shared V2 color tokens where appropriate and prevent the preview from drifting from production.
- `src/components/site/site-header.tsx` and `src/components/site/site-footer.tsx`: use a consistent Rhema wordmark lockup across public routes.
- `src/components/admin/auth-forms.tsx` and shared admin shell/page surfaces only if inspection or verification identifies styling that cannot be handled by the shared stylesheet.
- `docs/specs/phase01-design-system.md`: document the adopted palette and new site-wide status.
- `docs/progress.md`: record completed rollout and known issues.
- `AGENTS.md`: update the design-system reference only after implementation is validated.

Do not modify Supabase schemas, business logic, protected content, or unrelated files.

## Acceptance criteria

- The black-and-gold visual language is consistent across public and admin/auth routes and both design-system pages.
- The public header/footer and admin authentication have consistent Rhema branding.
- All interactive controls remain keyboard accessible, labeled, and visibly focused.
- Status and error states remain distinguishable on dark surfaces.
- Existing routes, access controls, forms, and data workflows are unchanged.
- Pages render without horizontal overflow at 375px, 768px, and 1440px.
- `npx tsc --noEmit`, `npm run lint`, and production build pass; existing tests remain green.

## Manual review steps

1. Review the homepage and its region, portfolio, journal, and contact sections.
2. Review listing and detail routes for properties and journal, plus regions, about, and contact.
3. Review admin sign-in and reset, dashboard, property/journal/region editors, and content editors using an authenticated test account.
4. Inspect `/design-system` and `/design-system-v2` for token accuracy.
5. At 375px, 768px, and 1440px, check navigation, forms, grids, tables/lists, images, and horizontal overflow.
6. Confirm focus visibility, error/success states, and existing behavior on each reviewed route.

## Validation results

- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- `npm test` passed.
- A production build passed with a temporary isolated `distDir` because the default `.next` directory was in use by an existing development server.
- `/design-system-v2` returned HTTP 200 with the adopted design-system title.
- Responsive screenshot and interaction review at 375px, 768px, and 1440px remains pending. Integrated browser automation timed out connecting over CDP.
