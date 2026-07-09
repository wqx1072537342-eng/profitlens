import type { Metadata } from "next";

import {
  absoluteUrl,
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
  description:
    "Upload Etsy CSV exports and generate a CPA-ready Etsy profit report with fees, refunds, shipping, tax, COGS, warnings, and Excel download.",
  metadataBase: new URL(siteUrl()),
  openGraph: {
    description:
      "Upload Etsy CSV exports and generate a CPA-ready profit report with fees, refunds, shipping, tax, COGS, warnings, and Excel download.",
    siteName: SITE_NAME,
    title: "Etsy Profit Report by ProfitLens",
    type: "website",
    url: absoluteUrl("/"),
  },
  title: {
    default: "Etsy Profit Report by ProfitLens",
    template: `%s | ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Upload Etsy CSV exports and generate a CPA-ready Etsy profit report with fees, refunds, shipping, tax, COGS, warnings, and Excel download.",
    title: "Etsy Profit Report by ProfitLens",
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
