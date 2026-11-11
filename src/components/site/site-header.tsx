import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/regions", label: "Regions" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-width site-header-layout">
        <Link className="site-brand" href="/" aria-label="Rhema Real Estates home">
          <span className="site-brand-name">Rhema</span>
          <span className="site-brand-description">Real Estates</span>
        </Link>

        <nav className="site-navigation" aria-label="Main navigation">
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
      </div>
    </header>
  );
}
