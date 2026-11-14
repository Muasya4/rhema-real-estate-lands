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
import { HeroImageShape } from "@/components/ui/hero-image-shape";
import { buildPageMetadata } from "@/lib/seo/site-url";
import { getPublicSiteContent } from "@/lib/site-content/data";

const phoneNumber = "0711634163";
const whatsappNumber = "254711634163";

export async function generateMetadata() {
  const content = await getPublicSiteContent();
  return buildPageMetadata({
    title: content["home.metaTitle"],
    description: content["site.metaDescription"],
    path: "/",
  });
}

export default async function Home() {
  const content = await getPublicSiteContent();
  const headline = content["home.title"];
  const highlightedWords = content["home.titleHighlight"];
  const highlightStart = headline.indexOf(highlightedWords);

  return (
    <>
      <main className="home-page" id="main-content">
        <section className="home-width home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="home-location-line">{content["home.locationLine"]}</p>
            <h1 className="home-title" id="home-title">
              {highlightStart >= 0 ? (
                <>
                  {headline.slice(0, highlightStart)}
                  <em>{highlightedWords}</em>
                  {headline.slice(highlightStart + highlightedWords.length)}
                </>
              ) : (
                headline
              )}
            </h1>
            <p className="home-intro">
              {content["home.intro"]}
            </p>
            <div className="home-hero-actions">
              <Link className="button button--primary-outlined" href="/regions">
                {content["home.locationsLink"]}
                <ArrowDownRight aria-hidden="true" size={14} />
              </Link>
              <Link className="home-text-link" href="/contact">
                {content["home.privateEnquiryLink"]}
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>
          </div>

          <figure className="home-hero-figure">
            <HeroImageShape className="home-image-frame home-image-frame--hero">
              <Image
                src={content["home.heroImagePath"]}
                alt={content["home.heroImageAlt"]}
                width={1200}
                height={1000}
                priority
              />
            </HeroImageShape>
            <figcaption className="home-image-caption">
              <span>{content["home.heroCaptionName"]}</span>
              <span>{content["home.heroCaptionLocation"]}</span>
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
                  src={content["home.portfolioImagePath"]}
                  alt={content["home.portfolioImageAlt"]}
                  width={1200}
                  height={1000}
                />
              </div>
              <figcaption className="home-image-caption">
                <span>{content["home.portfolioCaptionTitle"]}</span>
              </figcaption>
            </figure>

            <div className="home-portfolio-copy">
              <h2 className="home-section-title" id="portfolio-title">
                {content["home.portfolioTitle"]}
              </h2>
              <p className="home-section-copy">
                {content["home.portfolioCopy"]}
              </p>
              <p className="home-section-copy">
                {content["home.portfolioFollowUp"]}
              </p>
              <Link className="home-text-link" href="/contact">
                {content["home.portfolioLink"]}
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
                  {content["home.regionsTitle"]}
                </h2>
                <p className="home-section-copy">
                  {content["home.regionsCopy"]}
                </p>
              </div>
              <Link className="home-text-link" href="/contact">
                {content["home.regionsLink"]}
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>

            <Suspense
              fallback={
                <p className="region-load-message" aria-live="polite">
                  {content["regions.loading"]}
                </p>
              }
            >
              <HomeRegionList content={content} />
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
                  {content["home.enquiryTitle"]}
                </h2>
                <p className="home-section-copy">
                  {content["home.enquiryCopy"]}
                </p>
              </div>
              <Link className="home-text-link" href="/contact">
                {content["home.enquiryLink"]}
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>

            <ol className="home-enquiry-steps">
              <li className="home-enquiry-step">
                <span className="home-step-number">01</span>
                <h3>{content["home.stepOneTitle"]}</h3>
                <p>{content["home.stepOneCopy"]}</p>
              </li>
              <li className="home-enquiry-step">
                <span className="home-step-number">02</span>
                <h3>{content["home.stepTwoTitle"]}</h3>
                <p>{content["home.stepTwoCopy"]}</p>
              </li>
              <li className="home-enquiry-step">
                <span className="home-step-number">03</span>
                <h3>{content["home.stepThreeTitle"]}</h3>
                <p>{content["home.stepThreeCopy"]}</p>
              </li>
            </ol>
          </div>
        </section>

        <HomeJournal content={content} />

        <section
          className="home-contact"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="home-width home-contact-layout">
            <div>
              <h2 className="home-contact-title" id="contact-title">
                {content["home.contactTitle"]}
              </h2>
              <p className="home-contact-copy">
                {content["home.contactCopy"]}
              </p>
            </div>
            <div className="home-contact-actions">
              <a className="home-contact-link" href={`tel:${phoneNumber}`}>
                <Phone aria-hidden="true" size={16} />
                {content["home.callLink"]} {phoneNumber}
              </a>
              <a
                className="home-contact-link"
                href={`https://wa.me/${whatsappNumber}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" size={16} />
                {content["home.whatsappLink"]}
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>

    </>
  );
}
