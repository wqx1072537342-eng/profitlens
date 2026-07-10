import type { Metadata } from "next";

import {
  absoluteUrl,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  organizationJsonLd,
  SITE_NAME,
  siteUrl,
  softwareApplicationJsonLd,
} from "@/lib/seo/site";

import "./globals.css";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/"),
  },
  description: DEFAULT_SEO_DESCRIPTION,
  metadataBase: new URL(siteUrl()),
  openGraph: {
    description: DEFAULT_SEO_DESCRIPTION,
    siteName: SITE_NAME,
    title: DEFAULT_SEO_TITLE,
    type: "website",
    url: absoluteUrl("/"),
  },
  title: {
    default: DEFAULT_SEO_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description: DEFAULT_SEO_DESCRIPTION,
    title: DEFAULT_SEO_TITLE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [organizationJsonLd(), softwareApplicationJsonLd()];

  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
        {children}
      </body>
    </html>
  );
}
