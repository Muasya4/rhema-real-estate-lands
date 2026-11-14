# Inquiry flow and admin inbox

## Goal

Enable the public inquiry flow and give authenticated Rhema admins a private way to read submitted inquiries, from newest to oldest, including contact details, message, submission time, and any associated property.

## Skills read

- `supabase`: server-only credentials, RLS, and admin access.
- `build-editorial-ui`: reuse the current token system and responsive admin patterns.
- `write-rhema-copy`: use concise, specific interface wording.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase07-inquiry-forms.md`
- `docs/progress.md`
- `src/app/(public)/contact/page.tsx`
- `src/components/site/inquiry-form.tsx`
- `src/lib/inquiries/actions.ts`
- `src/lib/inquiries/submission.ts`
- `src/lib/inquiries/turnstile.ts`
- `src/lib/auth/guard.ts`
- `src/lib/supabase/auth-server.ts`
- `src/lib/supabase/service.ts`
- `src/lib/admin/properties/data.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/properties/page.tsx`
- `src/app/admin/journal/page.tsx`
- `src/app/globals.css`
- `supabase/migrations/20261106194113_initial_content_schema.sql`
- `tests/inquiries/run.cjs`
- `tests/inquiries/submission.test.cjs`
- `package.json`

The UI-registry search found no `context/ui-registry.md`. The worktree already contains unrelated changes in `AGENTS.md`, `docs/progress.md`, and `src/app/globals.css`, plus `prompts/simplify-home-portfolio-framing.md`. Preserve those changes.

## Decisions and sources

- Add a **read-only, admin-role-protected inbox** at `/admin/inquiries`. The request is to let admins see inquiry content; there is no inquiry status, reply, or deletion feature in the Phase 07 data model, so do not invent one.
- Reuse `requireAdmin()` and the authenticated Supabase server client. The existing inquiry RLS grants reads only to admins; do not broaden table grants or add public read/write policies.
- Query real inquiry records, sort newest first, validate database response shape, and show clear loading, empty, and read-error states. Include name, email, phone, message, creation date, and an explicitly joined property title/link when `property_id` exists. The schema and foreign key are in the Phase 03 migration.
- Add an admin-dashboard link and restrained, mobile-responsive styling using existing `globals.css` tokens and admin list patterns.
- Preserve the current server action protections: server validation, Turnstile verification, honeypot, and server-only Supabase secret client. Do not send email or expose secrets in public code.
- The production Contact page currently shows “The inquiry form is not available yet.” Required Vercel environment variable names are `SUPABASE_SECRET_KEY`, `TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY`, as recorded in `docs/progress.md` and `prompts/critical-live-inquiry-setup.md`. I cannot retrieve or set those secret values from this workspace. The owner must configure them directly in Vercel and redeploy; never send secret values in chat.
- Do not submit a production inquiry until the owner explicitly approves a synthetic test submission. No real person's inquiry will be used.

## Files to touch

- `src/lib/admin/inquiries/data.ts`: read and validate admin-visible inquiry records.
- `src/app/admin/inquiries/page.tsx`: protected inbox UI and states.
- `src/app/admin/page.tsx`: dashboard link.
- `src/app/globals.css`: inbox-only styles, integrating the existing uncommitted CSS changes.
- `tests/inquiries/admin-data.test.cjs` and `tests/inquiries/run.cjs`: test data mapping, query failures, and malformed records using repository test conventions.
- `docs/specs/phase07-inquiry-forms.md`: document admin visibility and current production prerequisite.
- `docs/progress.md`: record implementation, verification, and outstanding production checks while preserving existing work.
- `AGENTS.md`: update the known-issues entry after verified implementation, preserving existing work.

## Acceptance criteria

- Authenticated admins can open the inbox and read stored inquiry details, including property association where present.
- Unauthenticated and non-admin users are redirected through the existing admin guard; no public inquiry read/write access is introduced.
- Query, configuration, and invalid-record failures are reported without leaking message contents or credentials into logs.
- Empty inbox and database failure are distinguishable from a successful read.
- Inbox layout remains usable at 375px, 768px, and 1440px.
- Existing public-form validation and abuse protections remain intact.
- Targeted tests, type check, lint, and production build pass.
- Production submission is verified only after the owner configures the required Vercel variables, redeploys, and explicitly approves a synthetic submission.

## Manual test steps

1. Sign in as an admin and open `/admin/inquiries`; verify records, messages, contact information, dates, and property association.
2. Visit `/admin/inquiries` signed out and as a non-admin; verify both are denied access.
3. Check empty and database-failure states in a controlled test environment.
4. Review the inbox at 375px, 768px, and 1440px.
5. In Vercel Production, have the owner configure the three named variables directly, then redeploy.
6. After separate explicit approval, submit one clearly synthetic inquiry on the production Contact page and confirm it appears in the admin inbox. Do not use personal contact details.
