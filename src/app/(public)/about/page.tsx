import Image from "next/image";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
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
      className="about-leadership"
    >
      {imageSrc ? (
        <div className="about-leadership-image">
          <Image
            alt={`Portrait of ${profile.fullName}`}
            fill
            sizes="(max-width: 760px) 100vw, 40vw"
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
    <main className="route-page" id="main-content">
      <div className="site-width">
        <header className="route-intro">
          <h1 className="route-title">{content["about.title"]}</h1>
          <p className="route-description">{content["about.intro"]}</p>
        </header>

        <div className="about-company">
          <section aria-labelledby="about-work-title">
            <h2 className="about-section-title" id="about-work-title">
              {content["about.workTitle"]}
            </h2>
            <p>{content["about.workCopy"]}</p>
          </section>
          <section aria-labelledby="about-approach-title">
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
