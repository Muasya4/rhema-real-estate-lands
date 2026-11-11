# Phase 07: Inquiry Forms Implementation Plan

## Goal

Add a public, accessible general inquiry form to `/contact`, validate submissions on the server, and store valid inquiries in the development Supabase project without granting anonymous users direct table write access. Keep the existing phone and WhatsApp options.

Property-specific UI links will follow Phase 05. The action will accept an optional property ID and verify that it identifies a published property before writing.

## Implementation status

Implemented locally. Automated tests, TypeScript, lint, and production build pass. Live Turnstile verification and a hosted database insert remain pending local development keys; do not share these values or put them in `.env.example`.

## Skills and documentation read

- `supabase`: reviewed API key use, RLS/grants, server-only secret handling, and key deprecation guidance.
- `supabase-postgres-best-practices`: reviewed least privilege and RLS guidance.
- `build-editorial-ui`: follow existing `globals.css` tokens and the editorial reference; retain responsive form and keyboard-accessibility requirements.
- `write-rhema-copy`: use concise, Rhema-specific labels and feedback; no marketing claims.
- Supabase API keys documentation: publishable keys remain subject to grants/RLS; secret keys bypass RLS and must stay in server-controlled code.
- Supabase changelog: the current Flutter and CLI breaking changes do not affect this JavaScript server-action flow.
- Cloudflare Turnstile server-side validation docs: tokens are single-use and expire after five minutes; the server must call Siteverify.
- Installed Next.js 16.4.5 docs: Server Functions and form mutations; Server Actions are public POST endpoints and must validate every submission.
- `docs/specs/phase07-inquiry-forms.md`

## Files and resources inspected

- `AGENTS.md`
- `docs/product.md`
- `docs/progress.md`
- `docs/specs/phase07-inquiry-forms.md`
- `supabase/migrations/20261106194113_initial_content_schema.sql`
- `supabase/tests/database/content_schema_test.sql`
- `src/app/(public)/contact/page.tsx`
- `src/app/globals.css`
- `src/lib/supabase/server.ts`
- `package.json`
- Installed Next.js 16.4.5 mutation and data-security docs
- Supabase API key docs and changelog
- Cloudflare Turnstile validation docs

At planning time, the contact page had call and WhatsApp links only. The inquiries table has `name`, `email`, `phone`, `message`, nullable `property_id`, and RLS. The anonymous role has no inquiry grants or policies. The implementation adds the form and protected server-side submission path without changing those grants or policies.

## Decisions and sources

- **Abuse protection:** Use Cloudflare Turnstile with server-side Siteverify, a honeypot, bounded input validation, and a pending/disabled submit state. Cloudflare documents that a token can only be used once and is valid for five minutes. Do not claim IP rate limiting; no trusted rate-limit service is configured.
- **Database access:** Preserve the existing RLS and grants. Do not grant `anon` INSERT on `inquiries`; a direct public API caller would otherwise bypass the form's CAPTCHA checks. After validation, a server-only client using `SUPABASE_SECRET_KEY` inserts the record. The secret key bypasses RLS, so the Server Action must strictly validate every field, CAPTCHA result, and optional property ID before each insert. Never expose this key in browser code or `NEXT_PUBLIC_` variables.
- **Turnstile verification:** Verify tokens server-side against the Cloudflare Siteverify endpoint and require the expected success/action result. Fail closed if verification is unavailable, the token is absent/expired/replayed, or environment configuration is missing. Return a clear non-sensitive failure with phone/WhatsApp alternatives. Do not log inquiry contents or raw CAPTCHA tokens.
- **Property association:** Accept an optional UUID only after an anonymous RLS-governed lookup confirms the referenced property is published. This follows the property publication rule in the Phase 03 migration and avoids trusting a submitted property title. Phase 05 will add the property-specific form entry point.
- **Contact data:** Keep `0711634163` and WhatsApp `254711634163` from the existing contact page and `docs/product.md`.
- **Input bounds:** Limit name to 120 characters, email to 254 characters, phone to 32 characters and 7-15 digits, and message to 5,000 characters. These are application-level payload safeguards because the Phase 03 columns are unbounded text. Fifteen digits follows the E.164 maximum; other limits are local form guardrails and are mirrored in server validation and HTML controls.
- **Duplicate handling:** Disable repeat submission while pending and rely on Turnstile's single-use token to reject token replays. Do not claim broader per-IP rate limiting or duplicate suppression across newly issued tokens.
- **Environment:** Add empty variable names to the shareable `.env.example`; use ignored `.env.local` for development-only `SUPABASE_SECRET_KEY`, `TURNSTILE_SITE_KEY`, and `TURNSTILE_SECRET_KEY`. Do not request or print credentials in chat.
- **No hosted writes during validation:** Verify form validation and service behavior with automated stubs. Do not create test inquiries in the user's Supabase project without explicit approval.
- **Validation:** Ten focused automated tests pass, including mocked insertion, property association, rejection of unpublished properties, Turnstile failure/replay, honeypot handling, and insert failure. TypeScript, lint, and production build pass. Responsive checks at 375px, 768px, and 1440px found no horizontal overflow. No hosted inquiry rows were created.
- **Remaining manual test:** Configure development-only `SUPABASE_SECRET_KEY`, `TURNSTILE_SITE_KEY`, and `TURNSTILE_SECRET_KEY` in ignored `.env.local`, then test the live flow with synthetic data only after approval. No production project or external dashboard settings were changed.

## Files changed during implementation

- `src/app/(public)/contact/page.tsx`: add the form and preserve existing contact alternatives.
- `src/components/site/inquiry-form.tsx`: accessible client form, Turnstile widget integration, pending and result states.
- `src/lib/inquiries/actions.ts`: server action to parse and validate `FormData`, verify Turnstile, check optional property eligibility, and insert with explicit success/failure results.
- `src/lib/inquiries/submission.ts` and `src/lib/inquiries/turnstile.ts`: testable submission flow and server-side Siteverify validation.
- `src/lib/inquiries/validation.ts`: reusable server-side validation for input fields and optional property UUID.
- `src/lib/supabase/config.ts` and `src/lib/supabase/service.ts`: shared configuration checks and server-only client factory that requires a Supabase secret/service-role key and rejects publishable keys.
- `src/lib/supabase/server.ts`: reuse shared configuration validation for the public read client.
- `src/app/globals.css`: token-based responsive inquiry form states.
- `.env.example`: document the additional variable names with blank values only.
- `docs/specs/phase07-inquiry-forms.md`: mark the phase status and record implemented protections/requirements.
- `docs/progress.md`: record behavior, validation, and remaining environment or production setup issues.
- `tests/inquiries/` and `package.json`: add focused tests using the existing TypeScript package and Node test runner.

## Acceptance criteria

- `/contact` presents labeled, keyboard-accessible fields and keeps the documented phone and WhatsApp alternatives.
- Server-side validation is authoritative; malformed or oversized submissions never reach the database.
- A Turnstile token is required and verified server-side. Replayed, expired, missing, or invalid tokens cannot insert.
- Missing secrets, CAPTCHA outages, database errors, and invalid property IDs produce clear, non-sensitive failure feedback, never a success-shaped response.
- A successful submission is written with the correct optional `property_id`.
- Anonymous users still cannot directly select, insert, update, or delete inquiry rows through Supabase grants/RLS.
- The secret key and Turnstile secret are absent from browser bundles and tracked files.
- No inquiry contents or raw CAPTCHA token are logged.
- TypeScript, lint, production build, tests, and responsive review at 375px, 768px, and 1440px pass.
- No test data is written to the user's hosted project without approval.

## Manual test steps

1. Configure the development Supabase secret and Cloudflare Turnstile site/secret keys in ignored `.env.local`. Do not share them or commit them.
2. Restart the Next.js server and submit invalid, empty, and oversized form fields. Confirm no request succeeds and errors are announced accessibly.
3. Use Cloudflare's official Turnstile test keys in a local test environment to verify valid, invalid, expired, and replayed token behavior.
4. Verify a successful submission with a mocked Supabase client. For a live development-project insert, request approval first and use clearly synthetic data that can be removed afterward.
5. Submit an unknown/unpublished property ID and confirm it is rejected before insertion; verify a published property ID is associated correctly when Phase 05 integration is added.
6. Confirm anonymous direct table writes remain denied and secret variables do not appear in client output or tracked files.
7. Review keyboard flow and responsive layouts at 375px, 768px, and 1440px.
8. Run `npx tsc --noEmit`, `npm run lint`, `npm run build`, and the focused form tests.
