import type { MetadataRoute } from "next";

import { absoluteUrl, siteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: [
        "/",
        "/pricing",
        "/etsy-profit-report",
        "/etsy-tax-report",
        "/sample-report",
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
