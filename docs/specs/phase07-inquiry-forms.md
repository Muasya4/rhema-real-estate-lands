# Phase 07: Inquiry Forms

## Status

Implemented locally. The `/contact` page has a protected general inquiry form. Production submission remains blocked until its server-side Supabase and Turnstile environment variables are configured in Vercel. This is the first critical task for the next session; see the top of `docs/progress.md`.

## Goal

Provide a private inquiry form that records valid inquiries and gives the visitor clear success and failure feedback.

## Scope

- General inquiry form at `/contact`.
- Optional property-specific inquiry using nullable `property_id`.
- Server-side validation and database write through a server-only Supabase secret client.
- Server-verified Cloudflare Turnstile and a honeypot; anonymous direct table writes remain disabled.
- Pending, success, and actionable error states.
- Call and WhatsApp contact alternatives using `0711634163`.

## Requirements

- Match the `inquiries` fields in Phase 03: name, email, phone, message, optional property ID, and creation timestamp.
- Validate all fields on the server. Client-side checks are supplemental only.
- Validate any supplied property ID against an eligible property record; never resolve a property by title or location text.
- Public callers may submit through the validated server action but may not directly read, insert, edit, or delete inquiry records through Supabase.
- Do not log full inquiry contents or expose database credentials to the browser.
- Do not add email sending in this phase. `docs/product.md` defers email integration.
- Provide visible success and failure states. A failed insert must not look successful.
- Add appropriate abuse protections using available infrastructure. Do not claim rate limiting or CAPTCHA unless implemented and tested.
- Ensure keyboard access, labels, error associations, and mobile layout.

## Acceptance criteria

- Automated tests verify valid general and property-specific inquiries are passed to the insert with the correct association. A live hosted insert has not been tested.
- Invalid input and database failures return clear, non-sensitive feedback.
- Anonymous users cannot query or mutate stored inquiry records.
- Duplicate submissions and abuse are handled according to the agreed protection approach.
- Phone and WhatsApp alternatives use the documented contact number.
- Tests cover validation, mocked successful submission, Turnstile rejection and replay, property association checks, honeypot handling, and insert failure. Existing RLS/grants remain unchanged.
- The Contact page's inquiry-section heading and introduction are editable as page-section copy. Form labels, action text, validation and feedback wording, server-side rules, Turnstile checks, honeypot behavior, and Supabase authorization remain code-controlled.

## Dependencies

- Phase 02 public layout shell.
- Phase 03 inquiries schema, RLS, and server-side data access.
- Phase 05 for property-specific inquiry links.

## Validation

Automated tests cover server-side validation, mocked successful insertion, Turnstile rejection/replay, honeypot handling, property association, and database failure. Before accepting public inquiries, configure `SUPABASE_SECRET_KEY`, `TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY` in Vercel Production, redeploy, verify the live Turnstile flow and RLS/grants, and submit only synthetic data with owner approval. Do not grant anonymous direct inquiry-table writes.
