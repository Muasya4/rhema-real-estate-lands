import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Suspense } from "react";
import { HomeJournal } from "@/components/journal/home-journal";
import { HomeRegionList } from "@/components/regions/home-region-list";
import { buildPageMetadata } from "@/lib/seo/site-url";

const phoneNumber = "0711634163";
const whatsappNumber = "254711634163";

export const metadata = buildPageMetadata({
  title: "Land plots in Kenya",
  description:
    "Rhema Real Estates sells plots in the Nairobi Metropolitan Area, Kiambu, Machakos, Kajiado and Central Kenya.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <main id="main-content">
        <section className="home-width home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="home-location-line">Nairobi Metropolitan Area / Central Kenya</p>
            <h1 className="home-title" id="home-title">
              Land across <em>Nairobi</em> and Central Kenya.
            </h1>
            <p className="home-intro">
              Rhema Real Estates sells plots in the Nairobi Metropolitan Area,
              Kiambu, Machakos, Kajiado and Central Kenya.
            </p>
            <div className="home-hero-actions">
              <Link className="button button--primary-outlined" href="/regions">
                See our locations
                <ArrowDownRight aria-hidden="true" size={14} />
              </Link>
              <Link className="home-text-link" href="/contact">
                Make a private enquiry
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>
          </div>

          <figure className="home-hero-figure">
            <div className="home-image-frame">
              <Image
                src="/land-placeholder.svg"
                alt="Temporary illustration of open land, to be replaced with property photography"
                width={1200}
                height={1000}
                priority
              />
              <span className="home-image-label">Temporary land image</span>
            </div>
            <figcaption className="home-image-caption">
              <span>Rhema Real Estates</span>
              <span>Land in Kenya</span>
            </figcaption>
          </figure>
        </section>

        <section
          className="home-portfolio"
          id="portfolio"
          aria-labelledby="portfolio-title"
        >
          <div className="home-width home-portfolio-layout">
            <figure className="home-portfolio-figure">
              <div className="home-image-frame home-image-frame--portfolio">
                <Image
                  src="/land-placeholder.svg"
                  alt="Temporary illustration for Rhema Real Estates land portfolio"
                  width={1200}
                  height={1000}
                />
                <span className="home-image-label">Temporary land image</span>
              </div>
              <figcaption className="home-image-caption">
                <span>Land portfolio</span>
                <span>Photography to be added</span>
              </figcaption>
            </figure>

            <div className="home-portfolio-copy">
              <h2 className="home-section-title" id="portfolio-title">
                Ask Rhema about plots in your area.
              </h2>
              <p className="home-section-copy">
                Rhema sells plots in the Nairobi Metropolitan Area, Ruiru,
                Kamakis, the Thika Road corridor, Kiambu County, Machakos,
                Kajiado and Central Kenya.
              </p>
              <p className="home-section-copy">
                Ask Rhema about current plots and request details for the
                location you have in mind.
              </p>
              <Link className="home-text-link" href="/contact">
                Enquire about land
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="home-regions"
          id="regions"
          aria-labelledby="regions-title"
        >
          <div className="home-width">
            <div className="home-regions-heading">
              <div>
                <h2 className="home-section-title" id="regions-title">
                  Regions in focus
                </h2>
                <p className="home-section-copy">
                  Rhema Real Estates sells land across Nairobi, Kiambu,
                  Machakos, Kajiado and Central Kenya.
                </p>
              </div>
              <Link className="home-text-link" href="/contact">
                Ask about a region
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>

            <Suspense
              fallback={
                <p className="region-load-message" aria-live="polite">
                  Loading regions...
                </p>
              }
            >
              <HomeRegionList />
            </Suspense>
          </div>
        </section>

        <section
          className="home-enquiry-guide"
          aria-labelledby="enquiry-guide-title"
        >
          <div className="home-width">
            <div className="home-regions-heading">
              <div>
                <h2 className="home-section-title" id="enquiry-guide-title">
                  Start with the place.
                </h2>
                <p className="home-section-copy">
                  Tell Rhema which area you are considering, then ask about
                  current plots there.
                </p>
              </div>
              <Link className="home-text-link" href="/contact">
                Speak with Rhema
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>

            <ol className="home-enquiry-steps">
              <li className="home-enquiry-step">
                <span className="home-step-number">01</span>
                <h3>Name a region</h3>
                <p>
                  Choose one of the regions listed above, then ask Rhema about
                  current plots there.
                </p>
              </li>
              <li className="home-enquiry-step">
                <span className="home-step-number">02</span>
                <h3>Request plot details</h3>
                <p>
                  Contact Rhema to ask what is available in the area you have
                  chosen.
                </p>
              </li>
              <li className="home-enquiry-step">
                <span className="home-step-number">03</span>
                <h3>Speak directly</h3>
                <p>
                  Call or send a WhatsApp message to discuss your enquiry with
                  Rhema.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <HomeJournal />

        <section
          className="home-contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="home-width home-contact-layout">
            <div>
              <h2 className="home-contact-title" id="contact-title">
                Ask Rhema about land in your area.
              </h2>
              <p className="home-contact-copy">
                Call or send a WhatsApp message about plots in the Nairobi
                Metropolitan Area, Kiambu, Machakos, Kajiado or Central Kenya.
              </p>
            </div>
            <div className="home-contact-actions">
              <a className="home-contact-link" href={`tel:${phoneNumber}`}>
                <Phone aria-hidden="true" size={16} />
                Call {phoneNumber}
              </a>
              <a
                className="home-contact-link"
                href={`https://wa.me/${whatsappNumber}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" size={16} />
                WhatsApp Rhema
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>

    </>
  );
}
