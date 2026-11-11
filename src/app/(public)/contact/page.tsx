import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { buildPageMetadata } from "@/lib/seo/site-url";

export const metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Call or WhatsApp Rhema Real Estates about plots in Nairobi, Kiambu, Machakos, Kajiado and Central Kenya.",
  path: "/contact",
});

const phoneNumber = "0711634163";
const whatsappNumber = "254711634163";

export default function ContactPage() {
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
          <h1 className="route-title">Speak with Rhema.</h1>
          <p className="route-description">
            Call or send a WhatsApp message about plots in the Nairobi
            Metropolitan Area, Kiambu, Machakos, Kajiado or Central Kenya.
          </p>
        </header>

        <div className="contact-page-actions">
          <a className="contact-page-link" href={`tel:${phoneNumber}`}>
            <Phone aria-hidden="true" size={17} />
            <span>Call {phoneNumber}</span>
          </a>
          <a
            className="contact-page-link"
            href={`https://wa.me/${whatsappNumber}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={17} />
            <span>WhatsApp Rhema</span>
            <ArrowUpRight aria-hidden="true" size={14} />
          </a>
        </div>

        <section
          aria-labelledby="inquiry-section-title"
          className="inquiry-section"
        >
          <div className="inquiry-section-intro">
            <h2 className="inquiry-section-title" id="inquiry-section-title">
              Ask about land in Rhema&apos;s service areas.
            </h2>
            <p className="route-description">
              Send a question about plots in Nairobi, Kiambu, Machakos, Kajiado
              or Central Kenya.
            </p>
          </div>
          <InquiryForm siteKey={formConfigured ? siteKey : null} />
        </section>
      </div>
    </main>
  );
}
