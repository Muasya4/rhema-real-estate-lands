# Public Site Content Management

> Scope note: the original broad editable-copy proposal below was implemented, then narrowed by the user. The approved current scope is recorded in [content-management-scope-revision.md](./content-management-scope-revision.md). Navigation, footer, actions, forms, metadata, system states, destinations, and record-owned content are now code- or record-controlled.

## Goal

Let an authorized admin edit the fixed wording shown across Rhema's public website, with fields prefilled from the current wording and a reliable way to restore those original defaults.

## Skills read

- `supabase`: RLS, explicit grants, migration workflow, and Supabase documentation requirements.
- `supabase-postgres-best-practices`: schema and RLS guidance.
- `build-editorial-ui`: reuse the editorial design system and existing components.
- `write-rhema-copy`: preserve Rhema-specific plain English and do not invent company facts.

## Files and resources inspected

- Repository instructions: `AGENTS.md`.
- Public shell and layout: `src/app/(public)/layout.tsx`, `src/components/site/site-header.tsx`, `src/components/site/site-footer.tsx`, `src/components/site/mobile-site-navigation.tsx`.
- Static public routes: `src/app/(public)/page.tsx`, `about/page.tsx`, `properties/page.tsx`, `regions/page.tsx`, `journal/page.tsx`, `contact/page.tsx`.
- Database-backed public routes: `properties/[slug]/page.tsx`, `journal/[slug]/page.tsx`.
- Shared public content components: `src/components/journal/home-journal.tsx`, `src/components/site/inquiry-form.tsx`, and the public region and property card components.
- Existing admin patterns: `/admin`, `/admin/about`, `src/components/admin/about/leadership-form.tsx`, and the leadership server action/data modules.
- Relevant specs: `docs/specs/phase02-layout-shell.md`, `phase09-admin-properties.md`, `phase10-admin-blog.md`, and `phase11-seo-jsonld.md`.
- Supabase schema and RLS migration conventions under `supabase/migrations/`; latest Supabase changelog and Data API securing guide.
- No `context/ui-registry.md` or other `ui-registry.md` exists in the repository. Reuse the current admin form patterns and tokens in `src/app/globals.css`.

## Decisions and sources

- **Content scope, approved by the user:** Manage all fixed, public-facing wording in the shared shell, homepage, Properties, Regions, Journal, About, Contact, inquiry form, static metadata, accessibility labels, and loading/error/empty states. The user approved the broad scope and recommended low-friction grouped editor.
- **Dynamic records remain in their current editors:** Property facts and property copy remain in the property editor; region names remain in the region manager; Journal articles remain in the Journal editor; CEO identity and biography remain in the About editor. These records have separate schemas and workflows documented in `AGENTS.md` and the Phase 09/10 specs.
- **Keep fixed identity and behavior protected:** Do not allow content edits to change route destinations, phone/WhatsApp destinations, SEO canonical origins, authorization or form mechanics, data availability rules, structured-data facts, or code-only accessibility behavior. Their current values and constraints come from `docs/product.md`, Phase 02, Phase 07, and Phase 11.
- **Defaults:** Capture the exact current public wording in a typed, version-controlled default content map. An absent database override resolves to those defaults, so the first editor visit is prefilled without requiring admins to recreate current copy.
- **Persistence and access:** Store only approved public-content overrides in a new Supabase table. Enable RLS, allow public reads of published content overrides, and restrict writes and resets to admins using the existing `admin_roles` authorization pattern. Follow the imperative migration workflow and explicitly grant the roles needed for the Data API.
- **Admin editing behavior:** Group fields by page/section and show the effective current value in each input or textarea. Saving publishes the edited values immediately, then revalidates the affected public routes. The all-site reset requires an explicit confirmation; per-page reset restores that page's original default values.
- **Reset source:** A reset removes saved overrides and returns to the version-controlled copy already on the site. It does not erase property, region, Journal, or CEO records.
- **Copy:** Preserve the existing approved copy as the initial values. Do not invent business facts or write replacement marketing copy.

## Files to touch after approval

- Add a typed content model, exact default content map, validated public/admin read helpers, and cache revalidation behavior under `src/lib/site-content/` and `src/lib/admin/site-content/`.
- Add a protected `/admin/content` page and grouped editor components; add its link to `src/app/admin/page.tsx`.
- Wire the public shell, fixed public routes, public forms, shared sections, fallback states, and static-route metadata to the content read helper.
- Add an imperative Supabase migration for content overrides with RLS and admin-only mutations; add database and application tests.
- Update `docs/progress.md`, `AGENTS.md` known issues, and the affected phase specs.
- Add this plan at `prompts/content-management.md`.

## Acceptance criteria

- The admin can edit all in-scope fixed public-site wording from one protected content area.
- Fields are prefilled with either the saved wording or the exact current default. Blank or missing database content never replaces defaults with empty text.
- Save validates input, reports errors explicitly, persists only approved content keys, and updates public pages after revalidation.
- Admins can restore an individual page or the entire public site's wording to its current original defaults.
- Reset never changes dynamic property, region, Journal, or leadership records.
- Public content is readable without a user account; mutations and reset actions are denied to non-admins by both server-side guards and RLS.
- Editable text cannot introduce routes, arbitrary links, unapproved phone destinations, unsafe markup, or changes to auth, inquiry, or SEO security behavior.
- TypeScript, tests, lint, production build, and responsive browser review at 375px, 768px, and 1440px pass.

## Manual test steps

1. Sign in as an admin and open `/admin/content`. Confirm every content field has the current public wording prefilled.
2. Change a homepage heading and a shared navigation label, save, and verify both public changes appear after revalidation.
3. Use page reset and verify only that page returns to its in-code defaults.
4. Change content on more than one page, confirm the all-site reset, and verify all fixed public copy returns to the in-code defaults.
5. Confirm property, region, Journal, and CEO records remain unchanged after resets.
6. Attempt to visit the editor and invoke save/reset as a signed-out user and a non-admin. Confirm access is denied.
7. Review the public pages at 375px, 768px, and 1440px, check for overflow, and verify dynamic data and metadata remain correct.

## Approval record

The user approved this scope and the immediate-save behavior before implementation. The user also authorized reasonable additions needed to complete the editor. The migration is local only; it has not been applied to a hosted database.
