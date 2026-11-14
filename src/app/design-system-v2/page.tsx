import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, MapPin, Phone } from "lucide-react";
import styles from "./design-system-v2.module.css";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const colors = [
  { label: "Near black", value: "#090908", token: "canvas" },
  { label: "Charcoal", value: "#11110E", token: "panel" },
  { label: "Raised surface", value: "#191914", token: "raised" },
  { label: "Warm white", value: "#F2EFE5", token: "text" },
  { label: "Muted text", value: "#AAA697", token: "muted" },
  { label: "Gold", value: "#E4C73E", token: "gold" },
  { label: "Muted gold", value: "#9B8332", token: "goldMuted" },
  { label: "Fine rule", value: "#343225", token: "line" },
];

const regions = [
  "Nairobi Metropolitan Area",
  "Kiambu",
  "Machakos",
  "Kajiado",
  "Central Kenya",
];

export default function DesignSystemV2Page() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label="Rhema Real Estates home">
            <span className={styles.brandMark} aria-hidden="true">
              R
            </span>
            <span className={styles.brandText}>
              <span>Rhema</span>
              <small>Real Estates</small>
            </span>
          </Link>
          <nav className={styles.navigation} aria-label="Design system navigation">
            <Link href="/properties">Properties</Link>
            <Link href="/regions">Regions</Link>
            <a href="#design-tokens">Design tokens</a>
            <a href="#components">Components</a>
          </nav>
          <Link className={styles.headerAction} href="/contact">
            Enquire <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <h1 id="hero-title">
              Land across <em>Nairobi</em> and Central Kenya.
            </h1>
            <p className={styles.heroDescription}>
              Rhema Real Estates sells plots in the Nairobi Metropolitan Area,
              Kiambu, Machakos, Kajiado and Central Kenya.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.buttonPrimary} href="/properties">
                View properties <ArrowDownRight aria-hidden="true" size={16} />
              </Link>
              <Link className={styles.buttonText} href="/contact">
                Make a private enquiry <ArrowUpRight aria-hidden="true" size={15} />
              </Link>
            </div>
            <div className={styles.heroLocation}>
              <MapPin aria-hidden="true" size={15} />
              <span>Nairobi Metropolitan Area / Central Kenya</span>
            </div>
          </div>

          <figure className={styles.heroArtwork}>
            <Image
              className={styles.contourImage}
              src="/land-placeholder.svg"
              alt="Abstract contour-line illustration of land."
              width={1200}
              height={1000}
              priority
            />
            <figcaption className={styles.artworkCaption}>
              <span>Rhema Real Estates</span>
              <span>Land in Kenya</span>
            </figcaption>
            <div className={styles.artworkIndex} aria-hidden="true">
              <span>01</span>
              <span className={styles.artworkIndexRule} />
              <span>05</span>
            </div>
          </figure>
        </section>

        <section className={styles.regionBand} aria-label="Rhema service areas">
          {regions.map((region, index) => (
            <div className={styles.regionItem} key={region}>
              <span className={styles.regionNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{region}</span>
            </div>
          ))}
        </section>

        <section
          className={styles.section}
          id="design-tokens"
          aria-labelledby="tokens-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="tokens-title">Black, gold, and open space.</h2>
            </div>
            <p className={styles.sectionIntro}>
              Rhema&apos;s adopted black-and-gold system uses gold for key actions
              and details. Dark surfaces keep land imagery in focus.
            </p>
          </div>

          <div className={styles.colorGrid}>
            {colors.map(({ label, value, token }) => (
              <div className={styles.colorSample} key={token}>
                <span
                  className={styles.colorSwatch}
                  style={{ backgroundColor: `var(--${token})` }}
                  aria-hidden="true"
                />
                <span className={styles.colorName}>{label}</span>
                <span className={styles.colorValue}>
                  {value} / --{token}
                </span>
              </div>
            ))}
          </div>
          <p className={styles.tokenFootnote}>
            These values are the adopted interface palette. They are not a
            separate official brand color specification.
          </p>
        </section>

        <section className={styles.regionSection} id="regions">
          <div className={styles.regionIntro}>
            <h2>Land in the places Rhema serves.</h2>
            <p>
              Ask Rhema about current plots in the area you are considering.
            </p>
            <Link className={styles.buttonOutline} href="/regions">
              View regions <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <div className={styles.regionCards}>
            {regions.slice(1, 4).map((region, index) => (
              <Link
                className={styles.regionCard}
                href="/regions"
                key={region}
              >
                <span className={styles.regionCardNumber}>
                  0{index + 1}
                </span>
                <span className={styles.regionCardTitle}>{region}</span>
                <span className={styles.regionCardAction}>
                  Ask about this area <ArrowUpRight aria-hidden="true" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section
          className={styles.section}
          id="components"
          aria-labelledby="components-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <h2 id="components-title">Details for the next step.</h2>
            </div>
            <p className={styles.sectionIntro}>
              Buttons, status markers, and inquiry fields use the same quiet
              contrast and small gold details.
            </p>
          </div>

          <div className={styles.componentGrid}>
            <article className={styles.componentPanel}>
              <h3>Actions</h3>
              <div className={styles.actionSamples}>
                <Link className={styles.buttonPrimary} href="/contact">
                  Enquire about plots <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
                <Link className={styles.buttonOutline} href="/properties">
                  View properties
                </Link>
                <Link className={styles.buttonText} href="/regions">
                  See all regions <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              </div>
            </article>

            <article className={styles.componentPanel}>
              <h3>Property status styles</h3>
              <p className={styles.panelNote}>
                These are interface samples, not current property listings.
              </p>
              <div className={styles.statusSamples}>
                <span className={`${styles.status} ${styles.statusAvailable}`}>
                  <span aria-hidden="true" /> Available
                </span>
                <span className={`${styles.status} ${styles.statusReserved}`}>
                  <span aria-hidden="true" /> Reserved
                </span>
                <span className={`${styles.status} ${styles.statusSold}`}>
                  <span aria-hidden="true" /> Sold
                </span>
              </div>
            </article>

            <article className={`${styles.componentPanel} ${styles.propertyPanel}`}>
              <h3>Property card</h3>
              <div className={styles.propertyCard}>
                <div className={styles.propertyImage}>
                  <Image
                    className={styles.propertyContour}
                    src="/land-placeholder.svg"
                    alt=""
                    width={600}
                    height={360}
                  />
                </div>
                <div className={styles.propertyBody}>
                  <p className={styles.propertyMeta}>Rhema service areas</p>
                  <h4>Ask about current plots.</h4>
                  <p>
                    Request details for a location in the Nairobi Metropolitan
                    Area, Kiambu, Machakos or Kajiado.
                  </p>
                  <Link className={styles.buttonText} href="/contact">
                    Enquire about plots{" "}
                    <ArrowUpRight aria-hidden="true" size={15} />
                  </Link>
                </div>
              </div>
            </article>

            <article className={styles.componentPanel}>
              <h3>Private enquiry fields</h3>
              <p className={styles.panelNote}>
                Visual sample only. Use the contact page to send an enquiry.
              </p>
              <div className={styles.fieldStack}>
                <label className={styles.field}>
                  <span>Your name</span>
                  <input autoComplete="name" name="name" placeholder="Name" />
                </label>
                <label className={styles.field}>
                  <span>Area of interest</span>
                  <input
                    autoComplete="off"
                    name="area"
                    placeholder="For example, Kiambu"
                  />
                </label>
                <Link className={styles.buttonPrimary} href="/contact">
                  Continue to contact <ArrowUpRight aria-hidden="true" size={15} />
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className={styles.contactSection} id="inquiry">
          <div>
            <h2>Ask about land in your area.</h2>
            <p>
              Call Rhema to ask about current plots and request details for a
              location.
            </p>
          </div>
          <a className={styles.phoneLink} href="tel:0711634163">
            <Phone aria-hidden="true" size={17} />
            0711634163
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/" aria-label="Rhema Real Estates home">
          <span className={styles.brandMark} aria-hidden="true">
            R
          </span>
          <span className={styles.brandText}>
            <span>Rhema</span>
            <small>Real Estates</small>
          </span>
        </Link>
        <span>Rhema Real Estates design system</span>
        <Link href="/design-system">View component inventory</Link>
      </footer>
    </div>
  );
}
