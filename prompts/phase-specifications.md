# Phase Specification Documents Plan

## Goal

Create the 11 requested implementation specification documents under `docs/specs/`. Define an ordered, testable project roadmap that reflects the existing design system and home page, the provided Rhema product brief and data model, and the planned public pages without claiming that missing backend or content already exists.

## Skills and documentation read

- No implementation library is being changed. These are planning/specification documents.
- Read the project instructions, product document, progress record, existing home-page implementation, and root layout.
- `docs/specs/` and `context/ui-registry.md` do not yet exist.
- The design system and home page were previously implemented and validated, as recorded in `docs/progress.md`.

## Files inspected

- `AGENTS.md`
- `docs/product.md`
- `docs/progress.md`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `package.json`
- `prompts/design-system.md`
- `prompts/home-page.md`
- `prompts/home-page-expansion.md`

## Decisions and sources

- Put the documents under `docs/specs/`, matching the project's phase-spec convention in `AGENTS.md`.
- Use the exact requested filenames and phase order.
- Treat `AGENTS.md` and `docs/product.md` as the sources of truth for product scope, named regions, contact number, required entities/fields, server rendering, authentication, and security expectations.
- Treat `docs/progress.md` and the implementation as sources of current completion: design system and home page exist; the rest of the site and Supabase integration are not implemented.
- Keep each spec implementation-focused: goal, scope, dependencies, functional requirements, security/data constraints where relevant, acceptance criteria, validation, and unresolved decisions.
- Preserve the minimum five-page direction with public routes for home, portfolio, regions, journal, property detail, and contact/inquiry. Note that routes beyond `/` are future work and are not implemented by these documents.
- Do not invent property records, prices, plot sizes, company claims, article content, credentials, or database enum values not settled in the source materials.
- In the schema spec, call out any enum values, nullability, constraints, or policies that require confirmation/migration design rather than pretending they already exist.
- Keep the requested phase order. Link phases by actual dependencies: visual foundation before shared shell/pages; schema before data-backed public and admin features; auth before admin CRUD; inquiry storage before inquiry submissions; SEO after public data routes exist.
- Update `docs/progress.md` to record the roadmap and its known unresolved decisions. Do not edit application code.

## Files to create

- `docs/specs/phase01-design-system.md`
- `docs/specs/phase02-layout-shell.md`
- `docs/specs/phase03-properties-schema.md`
- `docs/specs/phase04-property-listing.md`
- `docs/specs/phase05-property-detail.md`
- `docs/specs/phase06-blog.md`
- `docs/specs/phase07-inquiry-forms.md`
- `docs/specs/phase08-admin-auth.md`
- `docs/specs/phase09-admin-properties.md`
- `docs/specs/phase10-admin-blog.md`
- `docs/specs/phase11-seo-jsonld.md`

## Files to update

- `docs/progress.md`: record the specifications roadmap and unresolved decisions without removing the current implementation history.

## Acceptance criteria

- All 11 requested files exist under `docs/specs/`, in the requested order and with the exact filenames.
- The specifications are internally consistent with `AGENTS.md`, `docs/product.md`, and the implemented design system/home page.
- Each phase includes concrete acceptance criteria and relevant validation steps.
- Dependencies and implementation boundaries are explicit. Future functionality is not described as already built.
- Unsettled schema, RLS, auth, content, and routing questions are clearly marked rather than guessed.
- No application code, dependencies, or credentials are changed.

## Manual test steps

1. Review the 11 documents in numeric phase order.
2. Verify each filename and path matches the requested tree.
3. Check data fields, service areas, phone number, auth boundaries, and page scope against `AGENTS.md` and `docs/product.md`.
4. Confirm the progress record includes a `Known issues` section describing unresolved decisions and does not erase existing work history.
5. Confirm the diff contains only the requested documentation and progress update.
