# Evans, set up your Rhema email on Zoho Free

This guide is for you as the owner of Rhema Real Estates. You will create and control the Zoho account. Your developer will make the DNS changes in Cloudflare using the exact values Zoho gives you.

The address you are setting up is `evans@rhemarealestates.com`.

## What you need

- Access to a personal email address and phone number you can use for Zoho signup and account recovery.
- Your developer's help with DNS changes. You have already given the developer access to the Cloudflare zone for `rhemarealestates.com`.
- About 30 minutes. DNS updates can take longer to appear.

Do not send your Zoho password, one-time codes, or recovery codes to your developer. The developer only needs the DNS record details Zoho asks you to publish.

## Step 1: Choose Zoho's Free plan

1. Open [Zoho Mail Free signup](https://mail.zoho.com/signup?type=org&plan=free).
2. Select the plan only if Zoho clearly labels it **Free**, **Forever Free**, or **Free Forever**, and does not ask for payment.
3. If Free is not offered, stop. Do not start a trial, select a paid plan, or enter payment details. Contact your developer before deciding what to do next.
4. Sign up using a personal email address and phone number that you can access now. You will need these to verify and recover the Zoho organization before the new Rhema mailbox works.
5. Keep the Zoho organization under your control. You should be its owner and organization administrator.

Zoho currently lists Free Forever for one custom domain and up to five users, with 5 GB of mailbox storage per user. It does not include IMAP, POP, or ActiveSync. Plan availability and features can change. Check [Zoho's current plan details](https://www.zoho.com/mail/zohomail-pricing.html).

## Step 2: Add Rhema's domain in Zoho

1. Sign in to Zoho Mail and open the **Admin Console**.
2. Open **Domains** and add `rhemarealestates.com`.
3. Choose manual DNS verification, such as the TXT method, if Zoho offers it. Zoho may also offer a Cloudflare one-click connection. Do not approve broad account access if you are unsure what it allows. Manual DNS is enough.
4. Zoho will display a verification record. Copy its record type, name/host, and value exactly.
5. Send those DNS details to your developer. It is safe to share the DNS record values with the developer you authorized. Do not send your Zoho login, password, or verification codes.
6. Wait for the developer to confirm the record is saved in Cloudflare. Then return to Zoho and select **Verify**.

If Zoho does not verify immediately, wait and try again later. DNS updates are not always visible right away.

Zoho's instructions: [add and verify a domain](https://www.zoho.com/mail/help/adminconsole/domain-verification.html).

## Step 3: Create your mailbox

1. In Zoho Admin Console, open **Users** and add `evans@rhemarealestates.com`, unless Zoho already created it during setup.
2. Make sure your account has the organization administrator access needed to manage the domain and mailbox.
3. Set your password yourself. Store it in a password manager you control.

## Step 4: Ask your developer to connect incoming email

Before any MX change, confirm whether anyone already receives email at `@rhemarealestates.com` through another provider. Changing MX records can interrupt that service.

1. In Zoho Admin Console, open the email or MX configuration for the domain.
2. Copy the complete MX records shown for your account, including each name, destination, and priority.
3. Send those records to your developer and ask them to check the existing mail records before changing anything.
4. Agree on a time to switch incoming mail if another provider is currently in use.
5. After your developer confirms the DNS changes, return to Zoho and verify MX.

Do not use MX values from a general web example. Zoho says the correct values can depend on its data center.

## Step 5: Ask your developer to add SPF and DKIM

In Zoho Admin Console, open your domain's SPF and DKIM setup. Copy the exact TXT record details Zoho provides and send them to your developer.

If you already see an SPF record or use another service to send email from `@rhemarealestates.com`, tell your developer before the record is changed. The domain should have one SPF record that accounts for all approved senders. Zoho will also show you when SPF and DKIM have been verified.

## Step 6: Test your mailbox

Once Zoho shows the domain and email records are verified:

1. Sign in to [Zoho Mail](https://mail.zoho.com/) as `evans@rhemarealestates.com`.
2. Send a test email to a personal address you can access.
3. Reply to that message and confirm the reply arrives in Zoho.
4. Send another message from your personal address to `evans@rhemarealestates.com` and confirm it arrives.
5. Ask your developer to confirm that the Cloudflare records still include the website's existing records.

If mail does not arrive, tell your developer which test failed and when it was sent. Do not send passwords or verification codes.

## What this setup does not do

This setup creates and tests your mailbox. It does not configure Supabase Auth emails, create your Rhema website administrator access, or make website inquiries arrive in your inbox.

The website's inquiry form does not automatically email new inquiries. The site's production inquiry setup and Supabase Auth email delivery are separate developer tasks. Zoho's Free plan listing does not include IMAP/POP, and you should not assume it supports the SMTP connection required by Supabase. The developer should confirm that with Zoho before using it for application email.

Official references:

- [Zoho Mail plans](https://www.zoho.com/mail/zohomail-pricing.html)
- [Zoho domain verification](https://www.zoho.com/mail/help/adminconsole/domain-verification.html)
- [Zoho MX setup](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html)
- [Zoho SPF setup](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html)
- [Zoho DKIM setup](https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html)
