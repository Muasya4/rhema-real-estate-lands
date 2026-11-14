# Set up `evans@rhemarealestates.com` on Zoho Mail Free

These steps are for Evans to create and own the Zoho organization and mailbox. Do not send anyone your password or verification codes.

## Before you start

You will need:

- Access to the DNS settings for `rhemarealestates.com`, or the person who manages the domain to make the DNS changes with you.
- A personal email address and phone number that you can access during setup. Use these for Zoho account verification and recovery until the Rhema mailbox is working.
- About 30 minutes. DNS updates may take longer to appear.

The Rhema website uses the domain too. You will change mail-related DNS records only. Do not change nameservers or website records such as `A`, `AAAA`, or `CNAME`.

## 1. Open Zoho's Free plan signup

Go to [Zoho Mail Free signup](https://mail.zoho.com/signup?type=org&plan=free).

Zoho currently lists a **Forever Free** plan for one custom domain and up to five users. It includes 5 GB of mailbox storage per user. It does not include IMAP, POP, or ActiveSync, and the plan is only available in some regions.

1. Select the plan only if Zoho clearly identifies it as **Free**, **Forever Free**, or **Free Forever**, with no payment required.
2. If the Free plan is not offered for your region or account, stop here. Do not start a trial, choose Mail Lite or Workplace, enter payment details, or accept an upgrade.
3. Continue through Zoho's signup screens and verify the contact email or phone that you can access.

Zoho can change its plans and signup screens. Check the [current Zoho Mail plans](https://www.zoho.com/mail/zohomail-pricing.html) before proceeding if the page does not match these instructions.

## 2. Add and verify Rhema's domain

1. In Zoho Mail, open the **Admin Console**.
2. Open **Domains** and choose **Add**.
3. Enter `rhemarealestates.com`.
4. Zoho will show a domain-ownership verification method, usually a TXT or CNAME record. Copy the exact name/host and value from Zoho.
5. In the service that manages the domain's DNS, add that record exactly as shown. Do not copy a sample value from another guide.
6. Return to Zoho and select **Verify**. If it does not verify immediately, wait and try again later. Do not remove the record after successful verification.

If you do not know where the domain's DNS is managed, ask the domain owner or website administrator. Zoho cannot host email for this domain until you can update its DNS.

See Zoho's guides for [adding a domain](https://www.zoho.com/mail/help/adminconsole/add-domains.html) and [verifying domain ownership](https://www.zoho.com/mail/help/adminconsole/domain-verification.html).

## 3. Create Evans's mailbox and administrator access

1. In the Zoho **Admin Console**, open **Users** and choose the option to add a user. Zoho may also offer this during initial setup.
2. Create the address `evans@rhemarealestates.com`.
3. Make sure Evans's account has the organization administrator role needed to manage the domain and mailboxes. Keep the Zoho organization under Evans's control.
4. If Zoho asks for a temporary password, set it privately and have Evans change it after signing in. Do not put it in this document or send it in an ordinary email or chat.
5. If the initial Zoho organization owner account is not Evans's, add Evans and transfer the organization administrator/super administrator role to him before handover.

Do not create a second `evans@rhemarealestates.com` user if Zoho created it during the signup flow. Check the user list first.

## 4. Point incoming email to Zoho

**Before changing MX records:** check whether anyone already receives email at `@rhemarealestates.com`. Changing MX records redirects incoming mail for the whole domain. If another mail service is in use, arrange the change with its owner first so existing mail is not interrupted.

1. In Zoho Admin Console, open the domain's **Email Configuration** or **MX** setup.
2. Copy the exact MX hostnames and priority values Zoho displays for your account.
3. In the domain's DNS settings, remove or replace only the old **MX records** when you are ready to move mail to Zoho.
4. Add all MX records Zoho requires, with the exact hosts and priorities shown in your Admin Console.
5. Save the changes, return to Zoho, and use its MX verification option.

Zoho's MX values can depend on its data center. Do not use values copied from a generic example or another Zoho account. Leave the website's `A`, `AAAA`, and `CNAME` records unchanged.

See [Zoho's MX setup guide](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html).

## 5. Set up SPF and DKIM

These records help other mail providers verify that messages sent from Rhema's domain are genuine.

1. In Zoho Admin Console, open the domain's **Email Configuration**.
2. Follow Zoho's SPF setup and use the exact TXT record it recommends.
3. If an SPF TXT record already exists, do not add a second SPF record. Ask the person managing DNS to update the existing SPF record to include all legitimate sending services.
4. In Zoho's DKIM setup, create a selector. Add the exact TXT name and value Zoho generates to DNS.
5. Return to Zoho and verify SPF and DKIM. Enable the verified DKIM selector for the domain if Zoho asks.

Do not remove records used by an existing email or website service. If you are unsure whether a record is in use, ask the DNS manager before changing it.

See Zoho's guides for [SPF](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html) and [DKIM](https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html).

## 6. Test the mailbox

1. Open [Zoho Mail](https://mail.zoho.com/) and sign in as `evans@rhemarealestates.com`.
2. Send a test message from this mailbox to an email address you can access.
3. Reply to that message and confirm the reply arrives in the Zoho inbox.
4. Send a separate message from an outside email account to `evans@rhemarealestates.com` and confirm it arrives.
5. Check Zoho's domain settings show the domain as verified and its MX, SPF, and DKIM checks as verified.
6. Save the recovery details securely in a password manager controlled by Evans.

If sending works but receiving does not, recheck the MX records in Zoho and the domain's DNS manager. DNS changes may take time to propagate.

## Important: this is not Supabase email setup

This process creates Evans's mailbox. It does not create his Rhema website administrator account, grant him an admin role in Supabase, or configure Supabase Auth email delivery. Zoho's free plan also does not include IMAP/POP. Confirm that any separate application or SMTP integration is supported by the selected plan and provider before relying on it.

For Supabase Auth email delivery, a separately configured production SMTP service is still required. See [Supabase's custom SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).

## Plan details checked

Zoho's [pricing page](https://www.zoho.com/mail/zohomail-pricing.html) was checked on 13 November 2026. Plan names, eligibility, and limits can change. If the Free plan is not explicitly available during signup, stop and ask Evans to decide whether to use a paid option.
