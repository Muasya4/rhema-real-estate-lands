import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { createLocalBusinessJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site-url";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const siteUrl = getSiteUrl();

  return (
    <div className="site-shell">
      {siteUrl ? (
        <JsonLd schema={createLocalBusinessJsonLd(siteUrl.toString())} />
      ) : null}
      <a className="site-skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
