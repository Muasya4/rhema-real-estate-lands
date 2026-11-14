import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MobileSiteNavigation } from "@/components/site/mobile-site-navigation";
import type { SiteContent } from "@/lib/site-content/defaults";

const navigationRoutes = [
  { href: "/", contentKey: "global.nav.home" },
  { href: "/properties", contentKey: "global.nav.properties" },
  { href: "/regions", contentKey: "global.nav.regions" },
  { href: "/journal", contentKey: "global.nav.journal" },
  { href: "/about", contentKey: "global.nav.about" },
  { href: "/contact", contentKey: "global.nav.contact" },
] as const;

export function SiteHeader({
  mobilePreview = false,
  content,
}: {
  mobilePreview?: boolean;
  content: SiteContent;
}) {
  const navigationLinks = navigationRoutes.map(({ href, contentKey }) => ({
    href,
    label: content[contentKey],
  }));

  return (
    <header
      className={`site-header${mobilePreview ? " site-header--mobile-preview" : ""}`}
    >
      <div className="site-width site-header-layout">
        <Link className="site-brand" href="/" aria-label={content["global.homeLinkLabel"]}>
          <span className="site-brand-mark" aria-hidden="true">
            R
          </span>
          <span className="site-brand-copy">
            <span className="site-brand-name">{content["global.brandName"]}</span>
            <span className="site-brand-description">
              {content["global.brandDescriptor"]}
            </span>
          </span>
        </Link>

        <nav
          aria-label={content["global.mainNavLabel"]}
          className="site-navigation"
        >
          {navigationLinks.map(({ href, label }) => (
            <Link
              className={
                href === "/contact"
                  ? "button button--primary-outlined site-nav-cta"
                  : "site-nav-link"
              }
              href={href}
              key={href}
            >
              {label}
              {href === "/contact" && (
                <ArrowUpRight aria-hidden="true" size={14} />
              )}
            </Link>
          ))}
        </nav>
        <MobileSiteNavigation
          defaultOpen={mobilePreview}
          links={navigationLinks}
          labels={{
            open: content["global.menuOpen"],
            close: content["global.menuClose"],
          }}
          navigationLabel={content["global.mainNavLabel"]}
        />
      </div>
    </header>
  );
}
