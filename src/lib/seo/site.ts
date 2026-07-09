export const SITE_NAME = "ProfitLens";
export const DEFAULT_SITE_URL = "https://profitlens-delta.vercel.app";

export function siteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  if (configuredUrl && !configuredUrl.includes("localhost")) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  return DEFAULT_SITE_URL;
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalizedPath}`;
}

export const publicRoutes = [
  {
    changeFrequency: "weekly" as const,
    path: "/",
    priority: 1,
  },
  {
    changeFrequency: "weekly" as const,
    path: "/etsy-profit-report",
    priority: 0.95,
  },
  {
    changeFrequency: "weekly" as const,
    path: "/etsy-tax-report",
    priority: 0.9,
  },
  {
    changeFrequency: "monthly" as const,
    path: "/sample-report",
    priority: 0.85,
  },
  {
    changeFrequency: "monthly" as const,
    path: "/pricing",
    priority: 0.75,
  },
  {
    changeFrequency: "yearly" as const,
    path: "/privacy",
    priority: 0.4,
  },
  {
    changeFrequency: "yearly" as const,
    path: "/terms",
    priority: 0.4,
  },
  {
    changeFrequency: "monthly" as const,
    path: "/contact",
    priority: 0.5,
  },
];

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl(),
    description:
      "ProfitLens helps Etsy sellers turn official CSV exports into CPA-ready profit reports.",
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "BusinessApplication",
    name: SITE_NAME,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free beta for Etsy CSV Profit Preview and Excel download.",
    },
    url: siteUrl(),
  };
}

export function faqJsonLd(
  faqs: readonly {
    question: string;
    answer: string;
  }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
      name: faq.question,
    })),
  };
}
