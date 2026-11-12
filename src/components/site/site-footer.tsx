import Link from "next/link";
import type { SiteContent } from "@/lib/site-content/defaults";

const footerRoutes = [
  { href: "/", contentKey: "global.nav.home" },
  { href: "/properties", contentKey: "global.nav.properties" },
  { href: "/regions", contentKey: "global.nav.regions" },
  { href: "/journal", contentKey: "global.nav.journal" },
  { href: "/about", contentKey: "global.nav.about" },
  { href: "/contact", contentKey: "global.nav.contact" },
] as const;

export function SiteFooter({ content }: { content: SiteContent }) {
  const footerLinks = footerRoutes.map(({ href, contentKey }) => ({
    href,
    label: content[contentKey],
  }));

  return (
    <footer className="site-footer">
      <div className="site-width site-footer-layout">
        <Link className="site-brand" href="/" aria-label={content["global.homeLinkLabel"]}>
          <span className="site-brand-name">{content["global.brandName"]}</span>
          <span className="site-brand-description">{content["global.brandDescriptor"]}</span>
        </Link>

        <nav
          aria-label={content["global.footerNavLabel"]}
          className="site-footer-navigation"
        >
          {footerLinks.map(({ href, label }) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>

        <a className="site-footer-phone" href="tel:0711634163">
          0711634163
        </a>
      </div>
    </footer>
  );
}
