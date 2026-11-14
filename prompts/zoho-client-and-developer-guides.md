# Zoho Client and Developer Guides

## Goal

Create two plain-language documents for setting up `evans@rhemarealestates.com` on Zoho Mail Free now that Evans owns the Zoho account and the developer has Cloudflare DNS access:

1. A CEO-facing checklist Evans can follow, with clear points to pause and hand the developer the exact DNS values Zoho provides.
2. A developer runbook for making only the required DNS changes in Cloudflare, coordinating Zoho verification, and testing the mailbox without exposing credentials or disrupting the website.

Explain separately that the website inquiry form does not currently send notifications to this mailbox and that Supabase Auth email delivery requires a separately verified SMTP provider. Do not promise that Zoho's Free plan supports Supabase SMTP.

## Skills read

- `write-rhema-copy`: direct, plain-English instructions; no marketing language.
- `supabase`: consulted to separate mailbox setup from Supabase Auth email delivery and application-admin provisioning.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase08-admin-auth.md`
- `docs/specs/phase07-inquiry-forms.md`
- `docs/progress.md`
- `ZOHO-FREE-EMAIL-SETUP.md`
- Existing plan: `prompts/zoho-free-email-instructions.md`
- Zoho pricing page, domain verification, MX, SPF, and DKIM documentation.
- Cloudflare DNS record management documentation.
- Supabase changelog and custom SMTP documentation.

## Decisions and sources

- **Separate responsibilities:** Evans creates and controls the Zoho organization, verifies the account, creates the mailbox, and keeps recovery credentials. The developer uses the Cloudflare access Evans granted to add only DNS records Zoho generates, then coordinates verification. No password, MFA code, API token, or Cloudflare login is shared.
- **Free-plan stop condition:** Zoho's current pricing page lists Free Forever for one domain and up to five users with 5 GB mailbox storage per user, without IMAP/POP/ActiveSync, and availability may vary by region. Evans must stop if Zoho does not explicitly offer the free plan; do not start a trial or paid subscription.
  - Source: https://www.zoho.com/mail/zohomail-pricing.html
- **Account-specific DNS values:** The developer guide will never prescribe copied MX, verification, SPF, or DKIM values. Evans supplies the records shown inside his Zoho Admin Console. Zoho says MX values depend on the data center.
  - Sources: https://www.zoho.com/mail/help/adminconsole/domain-verification.html, https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html, https://www.zoho.com/mail/help/adminconsole/spf-configuration.html, https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html
- **Cloudflare scope:** Instructions use Cloudflare's DNS Records page. Preserve website A/AAAA/CNAME records and nameservers. Do not replace existing MX records until confirming whether another mail provider is active. TXT and MX values are used as supplied by Zoho; DNS changes are not made by this assistant.
  - Source: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/
- **Application email is separate:** Phase 07 explicitly excludes email sending and current form submissions depend on deployment configuration; Phase 08 requires production SMTP for Supabase Auth recovery emails. The docs will not represent Zoho Free as suitable for SMTP unless the plan and Zoho account explicitly support authenticated SMTP.
  - Sources: `docs/specs/phase07-inquiry-forms.md`, `docs/specs/phase08-admin-auth.md`, https://supabase.com/docs/guides/auth/auth-smtp
- **No Supabase admin role work in the mail setup:** Creating a mailbox does not provision an application admin or change Supabase Auth settings. Those remain separate tasks using the trusted admin-provisioning process.

## Files to touch after approval

- Add `ZOHO-FREE-SETUP-FOR-EVANS.md` at the repository root.
- Add `ZOHO-CLOUDFLARE-DEVELOPER-RUNBOOK.md` at the repository root.
- Update `docs/progress.md` with the handoff documents and explicit outstanding SMTP/inquiry distinctions.
- Update the relevant Zoho item in `AGENTS.md` Known issues without changing unrelated work.

Keep the existing `ZOHO-FREE-EMAIL-SETUP.md` as the detailed reference.

## Acceptance criteria

- Evans's document reads as direct instructions addressed to him, not as a technical reference.
- The CEO and developer responsibilities are explicit and divided at the point Zoho generates DNS values.
- The developer runbook includes Cloudflare record-entry guidance, a pre-change DNS/MX review, preserving website records, rollback evidence, and end-to-end send/receive checks.
- Both docs use only Zoho-generated DNS values and do not ask for credentials or verification codes.
- Free-plan availability and limitations are clear; paid/trial selection is never presented as a continuation step.
- The documents state that mailbox setup does not activate Supabase Auth SMTP, website inquiry email notifications, or application-admin access.
- All relevant instructions link to current first-party documentation.

## Manual review steps

1. Confirm the CEO can follow their steps without needing to edit Cloudflare DNS.
2. Confirm the developer can identify their exact task and does not need Evans's password or MFA code.
3. Check that the runbook never instructs changing website records or replacing MX before checking existing email.
4. Verify there are no hard-coded account-specific DNS values, secrets, or claims that Zoho Free supports SMTP.
5. Confirm the docs distinguish mailbox send/receive tests from Supabase Auth and website inquiry delivery.
