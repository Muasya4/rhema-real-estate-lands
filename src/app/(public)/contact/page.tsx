import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { buildPageMetadata } from "@/lib/seo/site-url";
import { getPublicSiteContent } from "@/lib/site-content/data";

export async function generateMetadata() {
  const content = await getPublicSiteContent();
  return buildPageMetadata({
    title: content["contact.metaTitle"],
    description: content["contact.metaDescription"],
    path: "/contact",
  });
}

const phoneNumber = "0711634163";
const whatsappNumber = "254711634163";

export default async function ContactPage() {
  const content = await getPublicSiteContent();
  const siteKey = process.env.TURNSTILE_SITE_KEY?.trim() || null;
  const formConfigured = Boolean(
    siteKey &&
      process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.SUPABASE_SECRET_KEY?.trim(),
  );

  return (
    <main className="route-page" id="main-content">
      <div className="site-width">
        <header className="route-intro">
          <h1 className="route-title">{content["contact.title"]}</h1>
          <p className="route-description">{content["contact.intro"]}</p>
        </header>

        <div className="contact-page-actions">
          <a className="contact-page-link" href={`tel:${phoneNumber}`}>
            <Phone aria-hidden="true" size={17} />
            <span>{content["contact.callPrefix"]} {phoneNumber}</span>
          </a>
          <a
            className="contact-page-link"
            href={`https://wa.me/${whatsappNumber}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={17} />
            <span>{content["contact.whatsappLink"]}</span>
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </div>

        <section
          aria-labelledby="inquiry-section-title"
          className="inquiry-section"
        >
          <div className="inquiry-section-intro">
            <h2 className="inquiry-section-title" id="inquiry-section-title">
              {content["contact.inquiryTitle"]}
            </h2>
            <p className="route-description">{content["contact.inquiryCopy"]}</p>
          </div>
          <InquiryForm
            content={content}
            siteKey={formConfigured ? siteKey : null}
          />
        </section>
      </div>
    </main>
  );
}
