# Rhema Real Estates — Agent Context

## Role
You are a principal-level full-stack engineer building a luxury land agency website for Rhema Real Estates. You behave like a senior engineer, not a general assistant. The aesthetic is editorial, luxury, sleek — no AI slop, no emojis, no gradients. Icons only (Lucide React).

## What You Are Building
Rhema Real Estates is a land agency selling plots in the Nairobi Metropolitan Area, Ruiru, Kamakis, Thika Road corridor, Kiambu County, Machakos, Kajiado, Kagio, Kutus, Sagana, and Baricho. The site is a curated portfolio, not a listings catalogue. Every property is presented as an editorial feature. The primary action is a private inquiry, not a captured lead.

## How to Work
For every implementation request:
1. Read this file and the phase spec in /docs/specs/.
2. Inspect the existing codebase (design system, data helpers, schemas).
3. Read the relevant installed skills for any library you'll touch.
4. Write a plan to /prompts/[feature-name].md with: goal, skills read, files inspected, decisions + sources for every value, files to touch, acceptance criteria, manual test steps.
5. Ask one focused question at a time if ambiguous. Bring a recommendation: "A or B? I'd pick B because [reason]."
6. STOP and wait for approval.
7. Only after approval: implement.
8. Run type check, lint, build. Screenshot via browser. Verify against acceptance criteria.
9. Update /docs/progress.md and affected context files also write down ## Known issues of the problems we have encountered and if we have solved them or not.
10. Explain what changed and what to review carefully.

## UI Work
- Use the approved black-and-gold system across public and admin pages. Use `/design/events-district-1.png` for its dark palette and gold accents, while retaining the editorial typography, spacing, and restrained layout from `/design/editorial-reference.png`.
- Use the design system in globals.css. No hard-coded colors.
- No emojis. Use Lucide React icons only.
- No gradients, no glassmorphism, no AI-slop patterns.
- Large editorial imagery, generous whitespace, quiet typography.
- Price and status are small markers, not banners.

## Skills

Before touching any of these libraries, read the matching skill from `.github/skills/`:

- [Supabase]: `supabase` (schema, RLS, migrations, queries)
- [Editorial UI]: `build-editorial-ui` (public pages, layout, components)
- [Copy]: `write-rhema-copy` (any customer-facing text)

Next.js has version-matched docs in `node_modules/next/dist/docs/`. Read the relevant guide there before writing any code, per the auto-generated block at the bottom of this file.

## How This App Is Structured
- Properties and blog posts live in Supabase.
- Public pages are server-rendered (SEO). Admin pages are client-protected.
- RLS on every table. The database decides who reads what, not the app.
- Auth for admin: Supabase Auth (email/password). No public user accounts.
- Images: Supabase Storage with public read, admin-only write.
- Inquiry forms write to Supabase. No email API for now (can add later via Resend/Zoho SMTP).

## Data Model
### properties
- id (uuid, pk), title, slug (unique), description (rich text), location (text), region (stable slug referencing `regions.slug`), price_kes (nullable bigint whole KES), plot_size (nullable text), status (nullable enum: available, reserved, sold), featured (boolean), images (ordered jsonb array of `{ path, alt }` objects), is_published (boolean), created_at, updated_at
### regions
- slug (text, pk; generated from the initial name and stable after rename), name (unique case-insensitively), display_order, created_at, updated_at
### inquiries
- id (uuid, pk), name, email, phone, message, property_id (fk, nullable), created_at
### blog_posts
- id (uuid, pk), title, slug (unique), excerpt, content (rich text), cover_image (nullable), published_at (nullable; null is draft, future timestamps are scheduled), created_at, updated_at
### admin_roles
- user_id (uuid, fk to auth.users), role (text: admin)

The Phase 03 migration implements the application tables with RLS. The managed-region migration seeds the original 11 service areas and changes `properties.region` to a stable slug foreign key; region reads are public and region writes require an admin. A region referenced by a property cannot be deleted until that property is reassigned. Property and journal public reads are restricted to published records. Inquiry reads and writes are admin-only until Phase 07 adds the agreed public submission protections. Admin role grants are provisioned only through a trusted service-role process. Property image files use the public-read, admin-write `property-images` Storage bucket; upload size and MIME limits remain for the admin upload phase.


## Voice

Plain English. Short sentences. Specific to Rhema, not any land agency.

The test for every sentence: if I replaced "Rhema Real Estates" with another land agency, would this sentence still be true? If yes, rewrite it.

Examples of good copy:
- "A quarter-acre in Kamakis, five minutes from the Eastern Bypass. Suitable for a family home or a small rental block."
- "Rhema Real Estates sells land in Kiambu, Machakos, Kajiado, and the Thika Road corridor."

Examples of bad copy (do not write like this):
- "Discover your dream plot in Kamakis."
- "Elevate your lifestyle with our curated land collection."
- "Your journey to owning land starts here."

The full writing rules live in the `write-rhema-copy` skill. This section is the summary.

## Things Not to Do — Content

These are about what the site says, not how it's built. The `write-rhema-copy` skill enforces these.

- Never use emojis. Ever.
- Never use em dashes (—). Use a full stop, a comma, or a colon.
- Never use eyebrow tags (the small all-caps label above a heading).
- Never use marketing clichés: "Discover", "Elevate", "Unlock", "Seamless", "Curated experience", "Your journey".
- Never write a sentence that could apply to any real estate site. Every sentence must be about Rhema's specific plots, regions, or services.

## Things Not to Do — Design

- Never use gradients, glassmorphism, or generic AI patterns.
- Never use icon-in-a-box grids.
- Keep the approved black-and-gold palette consistent with the Events District reference and preserve the editorial layout principles from `/design/editorial-reference.png`.
- Never use hard-coded colors. Use tokens from `globals.css`.

## Things Not to Do — Engineering

- Never decide two properties are related by name or guess. A relation is a query.
- Never invent a price, location, or plot size. If it's missing, show "Price on request" or omit.
- Never expose admin routes without server-side auth verification. Middleware is not enough on its own; every server action verifies too.
- Never store secrets in code.
- Never let the agent choose the design. Match the reference.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## Known issues

- **Verified locally:** The managed-region migration preserved all 11 existing enum-based property references in a disposable PostgreSQL 18 database. Core RLS and delete-restriction behavior passed. The pgTAP suite still requires a Supabase-compatible run before staging.
- **Phase 10 admin Journal:** The editor is implemented locally. Authenticated editor review, live Supabase writes, and Storage uploads remain pending as recorded in `docs/progress.md`.
- **About page and CEO profile:** `/about` and its protected admin editor are implemented locally. The leadership migration and RLS passed an isolated PostgreSQL 18 smoke test; the pgTAP suite, authenticated UI/Storage review, responsive browser review, and hosted migration remain pending. No hosted database changes were made.
- **CRITICAL: Phase 07 production inquiry setup:** The protected, read-only `/admin/inquiries` inbox is implemented locally. The live Contact page still reports the form unavailable until `SUPABASE_SECRET_KEY`, `TURNSTILE_SECRET_KEY`, and `TURNSTILE_SITE_KEY` are configured in Vercel Production and the code is deployed. Then verify admin inbox access and, after owner approval, submit one synthetic inquiry. Never share secret values or enable anonymous direct inquiry-table writes.
- **Phase 11 SEO:** Production `SITE_URL` and `AUTH_SITE_URL` use `https://www.rhemarealestates.com`; the domain, canonical, sitemap, and admin sign-in were verified. Responsive browser review and checks against published property/article records remain pending.
- **Mobile navigation browser review:** The mobile menu implementation, type check, lint, and production build are complete. The integrated browser automation timed out connecting to CDP, so menu interaction and screenshots at 375px, 768px, and 1440px remain unverified.
- **Public page-content editor:** `/admin/content` is limited to public page-section headings/descriptions and the homepage hero/portfolio images. Navigation, footer, action labels, forms, metadata, system states, destinations, and dynamic records stay protected. Section restore is implemented; there is no site-wide reset. Tests, type-check, production build, and targeted lint passed. The full lint command did not finish, and integrated browser automation timed out connecting over CDP, so responsive review at 375px, 768px, and 1440px remains pending. The hosted status of the existing `site_content` migration is unconfirmed; authenticated upload/save/restore review remains pending. The local database lacks the table, so public reads use defaults. No hosted database changes were made.
- **Client presentation cleanup:** Homepage photography notices and unpublished journal teaser cards were removed. The approved abstract home illustrations remain without temporary labels. Property records with no uploaded images no longer show fallback placeholder artwork. Unit, type, lint, and production-build results are tracked in `docs/progress.md`; responsive browser review remains pending.
- **Zoho email handoff:** `ZOHO-FREE-SETUP-FOR-EVANS.md` and `ZOHO-CLOUDFLARE-DEVELOPER-RUNBOOK.md` separate the CEO's account setup from the developer's authorized Cloudflare DNS work; `ZOHO-FREE-EMAIL-SETUP.md` remains the detailed reference. No Zoho account or DNS changes have been made. Zoho Free SMTP availability is unconfirmed. Mailbox setup does not configure Supabase Auth SMTP, create the website admin role, or send inquiry notifications to email.
- **Production build duration:** Two isolated Next.js production builds have taken several minutes. The earlier build took about 4.8 minutes to compile and 6.2 minutes for TypeScript while lint and type-check ran concurrently. This build compiled in 3.6 minutes, TypeScript took 63 seconds, and static page generation took 43 seconds. Cause is unknown.
- **Approved black-and-gold design rollout:** Shared styles, TypeScript, lint, tests, and an isolated production build pass. The default build output conflicted with an already-running development server, so the build was isolated. Responsive browser review at 375px, 768px, and 1440px remains pending because CDP connection timed out.
- **Homepage Regions presentation:** Decorative portfolio/region indexes are removed, the region lists use open editorial styling with fine separators, and the enquiry step sequence is retained. The survey-line illustration was removed after review. TypeScript, lint, tests, and isolated build pass. Browser navigation and bounded direct requests to the local homepage and Regions route did not complete, so responsive visual review at 375px, 768px, and 1440px remains pending.
- **Homepage Land portfolio framing:** Layered square frames and the padded card were removed. The image and text stack through 1024px, with compact heading-to-copy-to-CTA spacing. TypeScript, lint, 142 tests, the isolated production build, browser review at 375px, 768px, and 1440px, and the final diff check pass.
