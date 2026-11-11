# Supabase App Connection Plan

## Goal

Prepare the Next.js app to make server-side requests to the configured Rhema development Supabase project, using only the project's publishable key and existing RLS policies. Do not configure or change production.

## Skills and documentation read

- `supabase`: reviewed API key guidance, RLS/grants behavior, client security, and package pinning requirements.
- Supabase API keys documentation: server-controlled code can use a publishable key when database access is limited by grants and RLS; secret keys bypass RLS and must not be used for public content reads.
- Supabase changelog: checked current breaking changes. The current Supabase Flutter v3 and CLI v3 changes do not affect this JavaScript client setup.
- Phase 04 property listing spec: public data must be server-rendered, use RLS as the visibility boundary, and distinguish errors from empty data.
- `AGENTS.md`: reviewed project architecture, app security rules, and the required plan/approval workflow.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase04-property-listing.md`
- `docs/progress.md`
- `prompts/phase03-properties-schema.md`
- `prompts/phase02-layout-shell.md`
- `package.json` and the beginning of `package-lock.json`
- `src/app/(public)/properties/page.tsx`
- `src/app/layout.tsx`
- `src/lib/properties/images.ts`
- `.gitignore`
- Supabase API keys documentation and changelog

No Supabase client package or client module exists. No root `.env` file is present. The current `/properties` route is an honest empty state and no data reads have been introduced.

## Decisions and sources

- Use the **development** Supabase project only. This follows the agreed next step and avoids changing the future production project.
- Use `@supabase/supabase-js` from a server-only module for the current public, unauthenticated read use case. Do not add browser-side access or a service-role/secret key. The Supabase API keys guide says publishable keys map to `anon` for unauthenticated requests, where grants and RLS remain in force.
- Pin the installed dependency version and update the npm lockfile, as required by the Supabase skill. Select the current compatible version during implementation from the npm registry.
- Read the project URL and publishable key from local server environment variables. Add only empty/documented variable names to a committed `.env.example`; do not create or alter `.env.local`, and do not request credentials in chat.
- Fail explicitly when required configuration is missing or malformed. Do not return an empty/success-shaped result when a client cannot be configured.
- Keep this milestone to connection setup. Do not add demo data, modify schema/RLS/Storage policies, expose a public inquiry form, or implement listing/detail pages.
- Because this checkout initially contained no local credentials, live connectivity was pending. After the user added the values to `.env.example`, they were moved into ignored `.env.local` and the shareable template was restored blank. A bounded anonymous read against the existing public schema now succeeds.
- `docs/progress.md` records that the app is connected; the pgTAP suite remains to be run.

## Files to touch after approval

- `package.json` and `package-lock.json`: add the pinned Supabase JavaScript client dependency.
- `.gitignore`: allow the credential-free `.env.example` to be tracked while keeping actual env files ignored.
- `.env.example`: document the server-side development URL and publishable-key variables without credentials.
- `src/lib/supabase/server.ts`: provide a server-only client factory with explicit configuration validation and no privileged key.
- `docs/progress.md`: document the setup and whether live connectivity remains pending.

## Acceptance criteria

- The Supabase dependency is pinned and the lockfile is consistent.
- Supabase client initialization is restricted to server-side modules.
- No secret/service-role key, project credential, demo record, or production setting is added to source control.
- Missing or malformed environment configuration produces a clear error.
- TypeScript, lint, and production build pass with no credentials configured.
- Live connectivity is clearly reported as pending until the user configures local development credentials; after configuration, an anonymous read confirms the configured project's public RLS behavior.

## Manual test steps

1. Copy the development project's URL and publishable key from Supabase into the documented variables in the ignored root `.env.local`. Do not paste credentials into chat or commit them.
2. Restart the Next.js development server.
3. Completed: a one-off anonymous query for `properties` selecting only `id` with a limit of 1 succeeded and returned zero rows. No test records were inserted.
4. Confirm no privileged key appears in the browser bundle or tracked files.
5. Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.

## Implementation record

- Added `src/lib/supabase/server.ts`, a server-only client factory that requires an HTTP(S) project URL and accepts only a publishable key or legacy `anon` key. Secret/service-role keys are rejected.
- Added `.env.example` and allowed that template through `.gitignore`; actual `.env.local` files remain ignored.
- Installed and pinned `@supabase/supabase-js` at `2.119.0`.
- Moved the values supplied in `.env.example` into ignored `.env.local`, renaming `NEXT_PUBLIC_SUPABASE_URL` to server-only `SUPABASE_URL`, and restored the blank template.
- Verified a bounded anonymous read against `properties`; it succeeded and returned zero rows.
- Updated `docs/progress.md`.
- Validation passed: TypeScript, ESLint, production build, runtime client-configuration checks, whitespace check, and production dependency audit (`npm audit --omit=dev`, 0 vulnerabilities).
