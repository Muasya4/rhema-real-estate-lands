# Phase 08: Production-Ready Admin Authentication Plan

## Goal

Build a private, invite-provisioned admin sign-in and account recovery flow for Rhema Real Estates. Protect every admin page and server action with a freshly verified Supabase user and a live `admin_roles` lookup. Keep public registration disabled.

## Skills and documentation read

- `supabase`: current Supabase SSR, Auth password, recovery, and MFA guidance; current Supabase changelog checked for relevant breaking changes.
- `build-editorial-ui`: editorial UI, accessible controls, design tokens, and responsive validation.
- `write-rhema-copy`: Rhema voice and button-label rules.
- Next.js 16.4.5 local docs: `proxy.ts`, Server Actions, route handlers, cache components, and cookies.
- NIST SP 800-63B-4: password-only authentication guidance. Single-factor passwords have a 15-character minimum; do not impose character-composition rules or periodic resets.

## Files and systems inspected

- `AGENTS.md`, Phase 08 and Phase 03 specs, `docs/progress.md`
- `package.json`, `src/app/layout.tsx`, `src/app/globals.css`
- `src/lib/supabase/server.ts`, `src/lib/supabase/service.ts`, `src/lib/supabase/config.ts`
- `src/lib/inquiries/actions.ts`, `src/lib/inquiries/submission.ts`
- Phase 03 migration, especially `admin_roles` RLS and admin-only table policies
- `.env.example`, existing tests and test runner
- Next.js 16.4.5 and Supabase SSR documentation:
  - https://supabase.com/docs/guides/auth/server-side/creating-a-client
  - https://supabase.com/docs/guides/auth/passwords
  - https://supabase.com/docs/guides/auth/auth-mfa
  - https://nextjs.org/docs/app/api-reference/file-conventions/proxy
  - https://pages.nist.gov/800-63-4/sp800-63b.html

The optional `context/ui-registry.md` is not present in this repository. Existing button and form-field patterns in `src/components/ui/` and `src/app/globals.css` will be reused.

## Decisions and sources

- **Authentication:** Email and password through Supabase Auth. No public sign-up route. Admin identities and `admin_roles` grants remain provisioned only through the trusted Supabase process documented in `AGENTS.md` and Phase 03.
- **MFA:** Password-only, at the user's request. Do not implement TOTP, phone-code MFA, passkeys, or email OTP as a claimed second factor. Document that email account security is a dependency and that password-only is less resistant to credential theft than MFA.
- **Password quality:** Require at least 15 characters for new or reset passwords and allow long passphrases. Do not add arbitrary character-composition rules or forced expiry. Configure the Supabase Auth password policy to match. Source: NIST SP 800-63B-4, password length and blocklist requirements.
- **Sign-in UX:** Email/password form with accessible show/hide password toggle using Lucide `Eye` and `EyeOff`; generic failure copy; pending, success, and error states. Never log passwords or tokens.
- **Recovery UX:** A clearly discoverable “Forgot password?” route; neutral confirmation regardless of whether an email exists; email link to a fixed, configured application origin; PKCE callback; safe internal return path; new-password and confirmation fields with visibility toggles; and a clear completion state. Source: Supabase password recovery and SSR PKCE documentation.
- **Email delivery:** Use Supabase Auth's configured email provider and templates. Add a deployment checklist for a verified sender, production SMTP, site URL, and exact redirect allowlist entries. Local code must fail clearly when the canonical app origin is missing; do not derive trusted redirect origins from an unvalidated `Host` header. No provider, sender, production domain, or credentials will be invented or configured by this code change.
- **Session handling:** Add pinned `@supabase/ssr` and cookie-bound server client. Use Next.js 16 `proxy.ts` only to refresh sessions and propagate cookie/cache headers. Use `auth.getUser()` for request-time identity verification and a live RLS-protected `admin_roles` query for authorization; do not treat Proxy or cookie/session claims as the authorization boundary. Supabase SSR and Phase 08 spec.
- **Authorization:** Central server-only `requireAdmin` guard used by every protected page and server action. Recheck user and role for each operation; deny revoked roles even while a valid Auth session exists. Never query admin access with the service-role client.
- **Redirects:** Accept only safe, same-origin admin paths; reject absolute URLs, protocol-relative paths, and non-admin destinations. Default to the admin landing route.
- **Deployment policy:** Keep Auth email signups disabled; enable email confirmation for admin accounts; configure redirect URLs narrowly; set Auth rate limits and CAPTCHA/abuse controls where supported. Document settings and staging verification. These Supabase Dashboard operations remain manual and require owner access.
- **Admin landing:** Provide a minimal protected `/admin` landing page and sign-out action to validate the access boundary. Property and journal management remain Phase 09/10 work.
- **Recovery and session revocation:** Password reset must work through the email recovery link. Sign-out invalidates the current session. Role revocation immediately denies admin access on the next guarded request; no self-service role changes or public account management are added.

## Files to touch

- `package.json`, `package-lock.json`: add exact, compatible `@supabase/ssr` dependency and lockfile update.
- `src/lib/supabase/server.ts` and a new browser-client helper if needed by the chosen form interaction pattern.
- New `src/lib/auth/` server-only utilities and authorization guard.
- New `src/proxy.ts` (or repository-root `proxy.ts`, according to the existing `src/app` layout) for scoped token refresh.
- New admin sign-in, recovery-request, reset-password, callback, and protected landing routes.
- New server actions for sign-in, recovery request, password update, and sign-out.
- New reusable password visibility control and auth form components.
- `src/app/globals.css`: token-based responsive admin/auth styles.
- `.env.example`: document a non-secret canonical site-origin variable only.
- `tests/`: mocked auth, role-guard, callback redirect, password validation, and UI/form behavior coverage; extend the existing test runner.
- `docs/specs/phase08-admin-auth.md`, `docs/progress.md`: update scope, setup requirements, validation, and unresolved external configuration.

No schema migration is expected: Phase 03 already creates `admin_roles`, enables RLS, and permits authenticated users to read only their own role row. No user or role will be provisioned during implementation.

## Acceptance criteria

- Admin routes and every admin action deny anonymous users and authenticated non-admins on the server.
- Admin role is checked from the database, not user-editable metadata, client state, or an unverified cookie.
- Revoking an admin role denies protected access on the next request.
- Sign-in, sign-out, recovery request, recovery callback, and password reset work with safe error states.
- Recovery responses do not disclose whether an email address is registered.
- Recovery redirects are constrained to the configured site origin and safe internal admin paths.
- Password reveal controls are keyboard accessible, labeled, and do not expose secrets in logs.
- New/reset passwords enforce the chosen 15-character minimum; project policy is documented to match.
- Public registration and self-service admin provisioning are absent.
- Supabase service-role/secret keys are never sent to client code.
- Automated auth and authorization tests, TypeScript, lint, production build, and browser checks at 375px, 768px, and 1440px pass.
- No production credentials, email, user creation, role grant, or Auth Dashboard setting is changed by the implementation.

## Manual test steps

1. In a disposable Supabase project, verify email signup is disabled, email confirmation is on, Auth's configured password minimum is 15, and the admin account is provisioned through the trusted process with a matching `admin_roles` row.
2. Configure development SMTP or another verified Supabase Auth email sender, the canonical development site URL, and only the required callback/reset URLs.
3. Sign in as an admin. Confirm the eye toggle, generic errors, role-gated landing page, and sign-out.
4. Sign in as an authenticated non-admin and request admin routes/actions. Confirm denial and no data access.
5. Request recovery for both a known and unknown address. Confirm indistinguishable success responses; for the known address, follow the email and set a valid new password.
6. Try an expired/invalid recovery token, a short password, a mismatched confirmation, and an external/protocol-relative redirect. Confirm each fails safely.
7. Revoke the admin role while leaving the session active. Confirm the next protected page and server action are denied.
8. Review browser UI and keyboard navigation at 375px, 768px, and 1440px.

## Approval gate

No implementation begins until the user approves this plan. The user chose password-only rather than TOTP or phone MFA. Email delivery and Supabase Dashboard policy configuration remain prerequisites for a live production test.
