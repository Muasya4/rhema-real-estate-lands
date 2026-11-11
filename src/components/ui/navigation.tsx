import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navigationLinks = [
  { href: "#tokens", label: "Tokens" },
  { href: "#type-scale", label: "Typography" },
  { href: "#components", label: "Components" },
];

export function Navigation() {
  return (
    <header className="showcase-header">
      <div className="showcase nav-layout">
        <Link className="brand-lockup" href="/design-system" aria-label="Rhema Real Estates">
          <span className="brand-name">Rhema</span>
          <span className="brand-description">Land Agency</span>
        </Link>
        <nav className="navigation-links" aria-label="Design system sections">
          {navigationLinks.map(({ href, label }) => (
            <Link className="nav-link" href={href} key={href}>
              {label}
            </Link>
          ))}
          <Link className="button button--primary-outlined nav-cta" href="#components">
            Explore components
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
