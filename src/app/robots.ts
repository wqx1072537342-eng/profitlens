import type { MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: [
        "/",
        "/contact",
        "/pricing",
        "/privacy",
        "/etsy-profit-report",
        "/etsy-tax-report",
        "/etsy-to-quickbooks",
        "/shopify-to-quickbooks",
        "/amazon-to-quickbooks",
        "/etsy-csv-converter",
        "/shopify-csv-converter",
        "/amazon-settlement-converter",
        "/csv-to-quickbooks",
        "/csv-data-cleaner",
        "/ai-field-mapping",
        "/sample-report",
        "/terms",
      ],
      disallow: [
        "/account",
        "/admin",
        "/api",
        "/auth",
        "/billing",
        "/dashboard",
        "/data-import",
        "/feedback",
        "/login",
        "/reports",
        "/settings",
        "/signup",
        "/upload",
      ],
      userAgent: "*",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
