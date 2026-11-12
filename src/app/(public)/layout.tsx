import type { ReactNode } from "react";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { createLocalBusinessJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getPublicSiteContent } from "@/lib/site-content/data";
import { getDefaultSiteContent } from "@/lib/site-content/defaults";

async function DynamicSiteHeader() {
  return <SiteHeader content={await getPublicSiteContent()} />;
}

async function DynamicSiteFooter() {
  return <SiteFooter content={await getPublicSiteContent()} />;
}

async function DynamicSkipLink() {
  const content = await getPublicSiteContent();
  return (
    <a className="site-skip-link" href="#main-content">
      {content["global.skipLink"]}
    </a>
  );
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  const siteUrl = getSiteUrl();
  const defaultContent = getDefaultSiteContent();

  return (
    <div className="site-shell">
      {siteUrl ? (
        <JsonLd schema={createLocalBusinessJsonLd(siteUrl.toString())} />
      ) : null}
      <Suspense
        fallback={
          <a className="site-skip-link" href="#main-content">
            {defaultContent["global.skipLink"]}
          </a>
        }
      >
        <DynamicSkipLink />
      </Suspense>
      <Suspense fallback={<SiteHeader content={defaultContent} />}>
        <DynamicSiteHeader />
      </Suspense>
      {children}
      <Suspense fallback={<SiteFooter content={defaultContent} />}>
        <DynamicSiteFooter />
      </Suspense>
    </div>
  );
}
