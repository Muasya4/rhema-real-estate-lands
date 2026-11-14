# Zoho Mail Free Plan Setup Instructions

## Goal

Create a root-level Markdown handoff guide Evans can follow to set up `evans@rhemarealestates.com` on Zoho's currently listed Free Forever plan, from signup through mailbox testing.

## Skills read

- `write-rhema-copy`: use direct, plain-English instructions.
- `supabase`: consulted to distinguish mailbox setup from Supabase Auth SMTP and avoid claiming this configures transactional email.

## Files and resources inspected

- `AGENTS.md`
- `docs/specs/phase08-admin-auth.md`
- `docs/progress.md`
- Current Zoho Mail pricing, domain setup, domain-verification, and MX-configuration documentation.
- Supabase Auth custom-SMTP documentation.

## Decisions and sources

- **Requested mailbox:** `evans@rhemarealestates.com`, from the user's request.
- **Free plan availability and limits:** Zoho's pricing page lists Free Forever for one custom domain, up to 5 users, 5 GB mailbox storage per user, no IMAP/POP/ActiveSync, and availability only in some regions. The guide will tell Evans to stop if this plan is not offered, without selecting a trial or paid plan.
  - Source: https://www.zoho.com/mail/zohomail-pricing.html
- **Domain ownership and DNS access:** Zoho requires proof of domain ownership and DNS access. The customer should use the exact verification record shown in Zoho, not a copied example.
  - Sources: https://www.zoho.com/mail/help/adminconsole/add-domains.html and https://www.zoho.com/mail/help/adminconsole/domain-verification.html
- **Mail routing:** The guide will use Zoho's exact MX records shown for the account's data center; it will not hard-code generic MX hosts. It will warn that changing MX records can interrupt existing email service, not change website A/CNAME records, and first confirm whether any mail service already uses this domain.
  - Source: https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html
- **Sender authentication:** Include following Zoho's generated SPF/DKIM values and not creating duplicate SPF records. Keep these records as shown in the tenant's Admin Console.
  - Sources: https://www.zoho.com/mail/help/adminconsole/spf-configuration.html and https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html
- **Account ownership:** Evans should create and retain the Zoho organization/admin account, use a reachable recovery email/phone during signup, and set the mailbox password himself. No credentials should be sent to Rhema or stored in the repository.
- **Supabase distinction:** Creating this mailbox does not provision an application admin in Supabase, verify Auth SMTP, or ensure public inquiries are emailed. The guide will state that it only sets up the mailbox.
  - Source: https://supabase.com/docs/guides/auth/auth-smtp

## Files to touch after approval

- Add `ZOHO-FREE-EMAIL-SETUP.md` at the repository root.
- Update `docs/progress.md` to note the handoff guide and any important limitation.

## Acceptance criteria

- Instructions run from opening the Free-plan signup through verifying inbound and outbound mailbox delivery.
- Free-plan selection is explicit; no paid plan/trial/payment path is suggested.
- Region/account eligibility caveat and all currently listed free-plan limitations are prominent.
- The guide warns about DNS ownership, exact Zoho-generated verification/MX/SPF/DKIM values, and risks of replacing existing MX records.
- No invented DNS values, credential examples, or requests to share passwords.
- It clearly separates mailbox setup from Supabase Auth SMTP and application-admin provisioning.
- Links point to Zoho/Supabase primary documentation.

## Manual review steps

1. Check the signup URL lands on Zoho's Free plan selection.
2. Verify each DNS instruction directs Evans to values generated in his own Zoho Admin Console.
3. Confirm the instructions explicitly say not to continue to a paid plan if Free is unavailable.
4. Confirm the final step tests sending and receiving mail at `evans@rhemarealestates.com`.
