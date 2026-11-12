import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getPublicSiteContent } from "@/lib/site-content/data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent();

  return {
    metadataBase: getSiteUrl() ?? undefined,
    title: {
      default: content["site.metaTitle"],
      template: "%s | Rhema Real Estates",
    },
    description: content["site.metaDescription"],
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
