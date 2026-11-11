import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/regions", label: "Regions" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-width site-footer-layout">
        <Link className="site-brand" href="/" aria-label="Rhema Real Estates home">
          <span className="site-brand-name">Rhema</span>
          <span className="site-brand-description">Real Estates</span>
        </Link>

        <nav className="site-footer-navigation" aria-label="Footer navigation">
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
