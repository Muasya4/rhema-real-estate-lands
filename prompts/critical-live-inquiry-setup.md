# Critical: Enable production inquiry submissions

## Goal

Make the Rhema inquiry form accept real submissions on the production website. Mark this as the first task to resume next session and guide the owner through each dashboard step without asking them to expose secret values.

## Skills read

- `supabase`: Supabase configuration and key safety.

## Files inspected

- `AGENTS.md`
- `docs/specs/phase07-inquiry-forms.md`
- `docs/progress.md`
- `src/lib/inquiries/actions.ts`
- `src/app/(public)/contact/page.tsx`

## Decisions and sources

- Set up production-only Vercel environment variables for `SUPABASE_SECRET_KEY`, `TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY`. The names come from the inquiry action and contact page.
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are already configured in Vercel Production, and the public site can read Supabase regions. Do not replace these unless verification shows they are incorrect.
- Keep secrets out of Git, documentation, chat, and browser-visible environment variables. Enter secret values directly in Vercel.
- Do not enable anonymous direct writes to the `inquiries` table. The existing server action validates submissions, verifies Turnstile, and uses the server-only Supabase secret client.
- The production site origin is `https://www.rhemarealestates.com`, based on the verified domain redirect and live canonical metadata.
- Do not submit a real person's inquiry as a test. Use synthetic data with the owner's explicit approval.

## Files to touch

- `docs/progress.md`: add a prominent critical / next-session-first item for completing and validating production inquiries; record completed domain and database connection setup and outstanding checks.
- `AGENTS.md`: update the known-issues summary so the current production origin is no longer described as undecided and the inquiry setup is identified as the immediate critical item.
- `docs/specs/phase07-inquiry-forms.md`: clarify that local implementation is complete while production configuration and live synthetic submission remain pending.

## Acceptance criteria

- The top of the progress tracker clearly identifies production inquiry configuration as the first task for the next session.
- The required production environment variable names are listed without secret values.
- The plan preserves inquiry RLS and server-side validation; no database policy is weakened.
- The progress and known-issues notes distinguish completed domain/Supabase public-read setup from pending inquiry secrets and Turnstile verification.
- No production settings, data, or code are changed as part of this documentation update.

## Manual test steps

1. Review the progress tracker and confirm the critical next-session task is prominent.
2. Confirm documentation contains only environment variable names, never secret values.
3. At the next session, guide the owner to set the three variables in Vercel Production, redeploy, then test one synthetic inquiry and confirm success in the admin inquiry view.
