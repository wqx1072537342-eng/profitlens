import type { MetadataRoute } from "next";

import { absoluteUrl, publicRoutes } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    changeFrequency: route.changeFrequency,
    lastModified,
    priority: route.priority,
    url: absoluteUrl(route.path),
  }));
}
