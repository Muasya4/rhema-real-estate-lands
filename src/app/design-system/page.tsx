import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BlogCard, PropertyCard } from "@/components/ui/cards";
import { Button } from "@/components/ui/button";
import { TextArea, TextInput } from "@/components/ui/fields";
import { SiteHeader } from "@/components/site/site-header";
import { Navigation } from "@/components/ui/navigation";
import { StatusBadge, type PropertyStatus } from "@/components/ui/status-badge";
import { getDefaultSiteContent } from "@/lib/site-content/defaults";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const colors = [
  { label: "Paper", value: "#f7f3f0", token: "--color-paper" },
  { label: "Surface", value: "#fcfaf8", token: "--color-surface" },
  { label: "Muted surface", value: "#eee8e4", token: "--color-surface-muted" },
  { label: "Ink", value: "#211d1a", token: "--color-ink" },
  { label: "Muted text", value: "#746b65", token: "--color-muted" },
  { label: "Rule", value: "#d8cfc8", token: "--color-line" },
  { label: "Terracotta", value: "#9e462c", token: "--color-accent" },
  { label: "Deep terracotta", value: "#77331f", token: "--color-accent-strong" },
  { label: "Soft terracotta", value: "#eadbd4", token: "--color-accent-soft" },
  { label: "Olive", value: "#65715a", token: "--color-olive" },
  { label: "Soft olive", value: "#e5e9e1", token: "--color-olive-soft" },
  { label: "Forest", value: "#193d32", token: "--color-forest" },
  { label: "White", value: "#ffffff", token: "--color-white" },
];

const typography = [
  { label: "Display", size: "--text-4xl", text: "Enduring Earth", display: true },
  { label: "Heading 1", size: "--text-3xl", text: "Sovereign heritage", display: true },
  { label: "Heading 2", size: "--text-2xl", text: "Curated land holdings", display: true },
  { label: "Heading 3", size: "--text-xl", text: "The regional portfolio", display: true },
  { label: "Large", size: "--text-lg", text: "Quiet and considered detail", display: false },
  { label: "Body", size: "--text-base", text: "Quiet details, considered presentation.", display: false },
  { label: "Small", size: "--text-sm", text: "Supporting copy and descriptions", display: false },
  { label: "Label", size: "--text-xs", text: "Location and editorial metadata", display: false },
  { label: "Fine label", size: "--text-2xs", text: "Small supporting metadata", display: false },
];

const spacing = [
  { label: "space-1", value: "0.25rem", token: "--space-1" },
  { label: "space-2", value: "0.5rem", token: "--space-2" },
  { label: "space-3", value: "0.75rem", token: "--space-3" },
  { label: "space-4", value: "1rem", token: "--space-4" },
  { label: "space-5", value: "1.25rem", token: "--space-5" },
  { label: "space-6", value: "1.5rem", token: "--space-6" },
  { label: "space-8", value: "2rem", token: "--space-8" },
  { label: "space-10", value: "2.5rem", token: "--space-10" },
  { label: "space-12", value: "3rem", token: "--space-12" },
  { label: "space-16", value: "4rem", token: "--space-16" },
  { label: "space-20", value: "5rem", token: "--space-20" },
];

const radii = [
  { label: "None", token: "--radius-none" },
  { label: "Small", token: "--radius-sm" },
  { label: "Medium", token: "--radius-md" },
  { label: "Large", token: "--radius-lg" },
  { label: "Pill", token: "--radius-pill" },
];

const statuses: PropertyStatus[] = ["available", "reserved", "sold"];

export default function DesignSystemPage() {
  const content = getDefaultSiteContent();

  return (
    <>
      <Navigation />
      <main className="showcase">
        <section className="showcase-intro showcase-intro--depth">
          <div>
            <p className="showcase-kicker">Rhema Real Estates / Foundation</p>
            <h1 className="showcase-title">
              A quieter language for <em>land.</em>
            </h1>
          </div>
          <p className="showcase-summary">
            A considered visual system shaped by editorial typography, warm
            materials, and careful detail. Tokens and interface components for
            the Rhema Real Estates experience.
          </p>
        </section>

        <section className="showcase-section showcase-section--tonal" id="tokens">
          <div className="section-heading">
            <div>
              <p className="section-kicker">01 / Color</p>
              <h2 className="section-title">A palette drawn from paper and earth</h2>
            </div>
            <p className="section-description">
              Warm neutrals and paper anchor the system. Forest green carries
              the strongest panels and interaction states. Use olive for small
              accents on light surfaces, and soft olive for highlighted words
              on forest. The italic word above demonstrates that pairing;
              terracotta remains a restrained accent.
            </p>
          </div>
          <div className="token-grid">
            {colors.map(({ label, value, token }) => (
              <div className="color-token" key={token}>
                <div
                  className="color-token__swatch"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <div className="color-token__details">
                  <span className="token-label">{label}</span>
                  <span className="token-value">
                    {value} / {token}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="showcase-section" id="type-scale">
          <div className="section-heading">
            <div>
              <p className="section-kicker">02 / Typography</p>
              <h2 className="section-title">Editorial contrast, quiet utility</h2>
            </div>
            <p className="section-description">
              An editorial system serif carries the headlines. Geist keeps
              navigation, data, and supporting copy clear.
            </p>
          </div>
          <div className="type-scale">
            {typography.map(({ display, label, size, text }) => (
              <div className="type-sample" key={label}>
                <span className="type-sample__value">
                  {label} / {size}
                </span>
                <p
                  className={`type-sample__preview ${display ? "type-sample__preview--display" : ""}`}
                  style={{ fontSize: `var(${size})` }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
          <div className="type-metrics">
            <p className="token-label">Families / line heights / tracking</p>
            <p className="type-metric type-metric--editorial">
              --font-editorial / Iowan Old Style, Baskerville, Georgia
            </p>
            <p className="type-metric type-metric--sans">
              --font-sans / Geist
            </p>
            <p className="type-metric type-metric--tight">
              --leading-tight / --tracking-tight
            </p>
            <p className="type-metric type-metric--snug">
              --leading-snug / --tracking-wide
            </p>
            <p className="type-metric type-metric--normal">
              --leading-normal
            </p>
          </div>
        </section>

        <section className="showcase-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">03 / Layout tokens</p>
              <h2 className="section-title">Measured space and restrained edges</h2>
            </div>
            <p className="section-description">
              A consistent spacing rhythm and subtle corner treatment keep the
              interface composed without decorative effects.
            </p>
          </div>
          <div className="token-bars">
            {spacing.map(({ label, token, value }) => (
              <div className="spacing-token" key={token}>
                <span className="token-label">{label}</span>
                <div
                  className="spacing-token__bar"
                  style={{ width: `var(${token})` }}
                />
                <span className="token-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="radius-grid">
            {radii.map(({ label, token }) => (
              <div className="radius-token" key={token}>
                <div
                  className="radius-token__sample"
                  style={{ borderRadius: `var(${token})` }}
                />
                <span className="token-label">
                  {label} / {token}
                </span>
              </div>
            ))}
          </div>
          <div className="elevation-token">
            <span className="token-label">--shadow-card</span>
            <div className="elevation-token__sample">Property and journal cards</div>
          </div>
        </section>

        <section className="showcase-section" id="components">
          <div className="section-heading">
            <div>
              <p className="section-kicker">04 / Components</p>
              <h2 className="section-title">A small, considered toolkit</h2>
            </div>
            <p className="section-description">
              Shared interface elements use the same material palette,
              typographic hierarchy, and clear interaction states.
            </p>
          </div>

          <div className="component-stack">
            <div>
              <p className="token-label">Navigation / responsive mobile menu</p>
              <p className="section-description">
                The public header uses this expandable menu at 760px and below.
                Open and close the preview to review its focus and motion states.
              </p>
              <div className="mobile-navigation-specimen">
                <SiteHeader content={getDefaultSiteContent()} mobilePreview />
              </div>
            </div>

            <div>
              <p className="token-label">Buttons / variants</p>
              <div className="component-row">
                <Button variant="primary-outlined">
                  Primary outlined <ArrowUpRight aria-hidden="true" size={14} />
                </Button>
                <Button variant="forest">
                  Forest action <ArrowUpRight aria-hidden="true" size={14} />
                </Button>
                <Button variant="secondary-text">Secondary text</Button>
                <Button variant="ghost">Ghost action</Button>
              </div>
              <p className="token-label">Navigation / hover and keyboard focus</p>
              <div className="component-row">
                <a className="forest-link-sample" href="#components">
                  Properties / hover to preview
                </a>
              </div>
            </div>

            <div>
              <p className="token-label">Status / property markers</p>
              <div className="component-row">
                {statuses.map((status) => (
                  <StatusBadge content={content} key={status} status={status} />
                ))}
              </div>
            </div>

            <div>
              <p className="token-label">Fields / input and textarea</p>
              <div className="field-grid">
                <TextInput
                  autoComplete="name"
                  label="Full name"
                  placeholder="Your name"
                />
                <TextInput
                  autoComplete="email"
                  label="Email address"
                  placeholder="you@example.com"
                  type="email"
                />
                <TextArea
                  label="Private note"
                  placeholder="Share a little about what you are looking for"
                  rows={4}
                />
              </div>
            </div>

            <div>
              <p className="token-label">Cards / property and journal</p>
              <div className="card-grid">
                <PropertyCard
                  href="#components"
                  imageAlt="Illustrated land contour placeholder."
                  imageIsPlaceholder
                  imageSrc="/land-placeholder.svg"
                  location="Location and region"
                  plotSize={null}
                  priceKes={null}
                  status={null}
                  title="Property card specimen"
                  content={content}
                />
                <BlogCard
                  category="Land journal"
                  excerpt="An editorial summary for a future journal article, set with a restrained measure and quiet supporting type."
                  href="#components"
                  imageLabel="Journal image placeholder"
                  title="Journal card specimen"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="showcase showcase-footer">
        Rhema Real Estates / Design system foundation
      </footer>
    </>
  );
}
