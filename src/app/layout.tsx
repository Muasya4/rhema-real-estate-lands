import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl() ?? undefined,
  title: {
    default: "Rhema Real Estates | Land in Kenya",
    template: "%s | Rhema Real Estates",
  },
  description:
    "Rhema Real Estates sells plots across the Nairobi Metropolitan Area, Kiambu, Machakos, Kajiado and Central Kenya.",
};

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
