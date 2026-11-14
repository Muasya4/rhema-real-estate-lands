import Image from "next/image";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getPublicLeadershipProfile } from "@/lib/leadership/data";
import { buildPageMetadata } from "@/lib/seo/site-url";
import { getPublicSiteContent } from "@/lib/site-content/data";
import type { SiteContent } from "@/lib/site-content/defaults";

export async function generateMetadata() {
  const content = await getPublicSiteContent();
  return buildPageMetadata({
    title: content["about.metaTitle"],
    description: content["about.metaDescription"],
    path: "/about",
  });
}

async function LeadershipSection({ content }: { content: SiteContent }) {
  const result = await getPublicLeadershipProfile();

  if (result.status === "error") {
    return (
      <section
        aria-labelledby="about-leadership-title"
        className="about-leadership about-leadership--error"
        role="alert"
      >
        <h2 className="about-section-title" id="about-leadership-title">
          {content["about.leadershipErrorTitle"]}
        </h2>
        <p>{content["about.leadershipErrorCopy"]}</p>
      </section>
    );
  }

  const { profile, imageSrc } = result;

  return (
    <section
      aria-labelledby="about-leadership-title"
      className={`about-leadership${imageSrc ? "" : " about-leadership--no-image"}`}
    >
      {imageSrc ? (
        <div className="about-leadership-image">
          <Image
            alt={`Portrait of ${profile.fullName}`}
            fill
            sizes="(max-width: 760px) 12rem, 18rem"
            src={imageSrc}
          />
        </div>
      ) : null}
      <div className="about-leadership-content">
        <p className="about-leadership-title">{profile.title}</p>
        <h2 className="about-section-title" id="about-leadership-title">
          {profile.fullName}
        </h2>
        {profile.biography ? (
          <p className="about-leadership-biography">{profile.biography}</p>
        ) : null}
        <a
          className="home-text-link"
          href={`mailto:${profile.email}`}
        >
          {content["about.emailLinkPrefix"]} {profile.fullName}
          <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      </div>
    </section>
  );
}

export default async function AboutPage() {
  const content = await getPublicSiteContent();

  return (
    <main className="route-page about-page" id="main-content">
      <div className="site-width">
        <header className="route-intro about-intro">
          <div className="about-intro-heading">
            <h1 className="route-title">{content["about.title"]}</h1>
          </div>
          <div className="about-intro-aside">
            <p className="route-description">{content["about.intro"]}</p>
            <div className="about-intro-actions">
              <Link className="button button--primary-outlined" href="/properties">
                {content["global.nav.properties"]}
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
              <Link className="home-text-link" href="/contact">
                {content["global.nav.contact"]}
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            </div>
          </div>
        </header>

        <div className="about-company">
          <section aria-labelledby="about-work-title">
            <span aria-hidden="true" className="about-section-index">
              01
            </span>
            <h2 className="about-section-title" id="about-work-title">
              {content["about.workTitle"]}
            </h2>
            <p>{content["about.workCopy"]}</p>
          </section>
          <section aria-labelledby="about-approach-title">
            <span aria-hidden="true" className="about-section-index">
              02
            </span>
            <h2 className="about-section-title" id="about-approach-title">
              {content["about.approachTitle"]}
            </h2>
            <p>{content["about.approachCopy"]}</p>
          </section>
        </div>

        <Suspense
          fallback={
            <p className="about-leadership-loading" aria-live="polite">
              {content["about.leadershipLoading"]}
            </p>
          }
        >
          <LeadershipSection content={content} />
        </Suspense>
      </div>
    </main>
  );
}
