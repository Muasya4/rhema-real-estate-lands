# Rhema Real Estates — Product Document

## What It Is
A luxury land agency website. Editorial, photography-led, curated. Plots for sale in specific Kenyan regions.

## Who It's For
Buyers assessing a small number of plots, often before travelling to see them. They are not browsing thousands of listings. They want atmosphere, detail, and a private enquiry route.

## Why This Hasn't Stuck Before
Most Kenyan land agency sites look like marketplaces: maximum listings, maximum density, banners, WhatsApp buttons everywhere. This one leads with photography and quiet typography. It's a bet that the luxury presentation itself attracts the right buyer.

## In Scope
- Editorial property listings (curated, not infinite scroll)
- Property detail pages with photography, plot size, location, price
- Blog for land-buying guides and region insights
- Private inquiry form (name, email, phone, message)
- Admin dashboard for properties and blog posts
- SEO: metadata, JSON-LD (LocalBusiness, Place, BreadcrumbList)
- Contact: phone 0711634163 (call + WhatsApp)

## Out of Scope (for v1)
- Mortgage calculator (can add later)
- User accounts (public)
- Interactive maps (can add later)
- Online payments
- Chatbot / AI agent (add later if needed)

## Where This Is Likely to Go Wrong (Silent Failures)
- RLS misconfigured → one admin can edit another's data (silent until audited)
- Images uploaded without optimization → slow LCP (visible but often ignored)
- SEO metadata missing on property pages → invisible to search
- Inquiry forms fail silently → lost leads (add success/error states)
- Admin routes protected only client-side → anyone can access if they know the URL (must be server-verified)