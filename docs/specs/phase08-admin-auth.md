# Phase 08: Admin Authentication

## Status

Implemented in application code. Supabase Auth project settings, trusted admin provisioning, and live email recovery verification remain deployment prerequisites.

## Goal

Establish secure server-verified administrator access for property and blog management.

## Scope

- Admin sign-in and sign-out using Supabase Auth email/password.
- Server-side session verification for admin pages and mutations.
- Admin-role verification against `admin_roles`.
- Safe redirect and unauthorized behavior.

## Requirements

- There are no public user accounts in v1.
- Verify the authenticated user and admin role on the server for every protected page and server action.
- Middleware/proxy may improve navigation behavior but must not be the only authorization boundary.
- Do not trust client-supplied user IDs, role claims, or admin flags.
- Prevent users from granting or editing their own admin role.
- Store Supabase credentials only in environment configuration. Expose only keys intended for browser use.
- Use generic authentication errors that do not disclose whether an email address exists.
- Ensure logout invalidates the session and protected routes cannot be reached with stale client state.

## Acceptance criteria

- Unauthenticated users cannot read admin pages or perform admin mutations.
- Authenticated non-admin users are denied server-side.
- Only users with a valid admin role can proceed.
- Each protected server action revalidates the session and role.
- Sign-in and sign-out behavior is tested, including expired and invalid sessions.
- No secrets are committed or sent to the browser.

## Dependencies

- Phase 03 `admin_roles` schema, RLS, and trusted role provisioning.
- Configured Supabase Auth project and environment variables.

## Validation

Automated tests cover safe redirects, generic sign-in and recovery responses, rejecting a non-admin, live role lookup behavior, recovery callbacks, password validation, password updates, and global session revocation failures. The tests use mocked Supabase responses; they do not prove hosted-project settings or email delivery.

The application passed 40 automated tests, TypeScript, lint, and a production build. Browser review confirmed the sign-in, recovery, and reset pages render, the password visibility control works, `/admin` denies an unauthenticated browser, and login has no horizontal overflow at 375px, 768px, and 1440px. Recovery email submission and real admin sign-in were intentionally not performed.

Before production, complete and verify these steps in the intended Supabase project:

1. Keep public email sign-ups disabled and enable email confirmation for provisioned admin accounts.
2. Set the Auth password minimum to 15 characters. Use a breached-password blocklist when available. Do not require arbitrary character classes or forced periodic resets.
3. Configure Auth rate limits and abuse protection, including CAPTCHA where supported and appropriate.
4. Configure a verified sender and production SMTP. Review the recovery email template and test delivery in staging.
5. Set `AUTH_SITE_URL` to the canonical HTTPS origin for each deployment and add only the exact callback URL (`<origin>/auth/callback`) to the Auth redirect allowlist.
6. Provision the initial account and `admin_roles` row through the trusted process. Do not add a public sign-up or self-service role grant.
7. In staging, test admin, non-admin, invalid/expired recovery link, successful recovery, session revocation, sign-out, and revoked-role denial on protected pages and actions.

The user chose password-only authentication and declined MFA. This is an accepted product decision, not an implementation of a second factor; it offers less protection against stolen credentials than MFA.
