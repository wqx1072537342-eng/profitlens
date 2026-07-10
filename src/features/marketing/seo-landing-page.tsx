import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/site";

export interface LandingPageConfig {
  canonicalPath: string;
  ctaHref: string;
  ctaLabel: string;
  description: string;
  h1: string;
  highlights: string[];
  kicker: string;
  status: "Available" | "Coming Soon";
  title: string;
}

export function landingMetadata(config: LandingPageConfig): Metadata {
  return {
    alternates: {
      canonical: absoluteUrl(config.canonicalPath),
    },
    description: config.description,
    openGraph: {
      description: config.description,
      title: config.title,
      type: "website",
      url: absoluteUrl(config.canonicalPath),
    },
    title: config.title,
    twitter: {
      card: "summary_large_image",
      description: config.description,
      title: config.title,
    },
  };
}

export function SeoLandingPage({ config }: { config: LandingPageConfig }) {
  const isAvailable = config.status === "Available";

  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <PublicHeader />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-800">
            {config.kicker}
          </p>
          <h1 className="mt-3 text-5xl font-black leading-tight">{config.h1}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {config.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
              href={config.ctaHref}
            >
              {config.ctaLabel}
            </Link>
            <Link
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              href="/#how-it-works"
            >
              See How It Works
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-wide text-slate-500">
              Status
            </p>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                isAvailable
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : "border-stone-200 bg-stone-50 text-slate-500"
              }`}
            >
              {config.status}
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {config.highlights.map((item) => (
              <div className="rounded-md border border-stone-200 bg-stone-50 p-4" key={item}>
                <p className="text-sm font-semibold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          {isAvailable ? (
            <p className="mt-5 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-950">
              Etsy CSV analysis is available now in the FlowSync AI beta.
            </p>
          ) : (
            <form
              action="mailto:support@flowsyncdata.com"
              className="mt-5 grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-4"
            >
              <p className="text-sm font-bold text-amber-950">
                This integration is Coming Soon. Email us to join the waitlist.
              </p>
              <input
                className="rounded-md border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
                name="email"
                placeholder="you@example.com"
                type="email"
              />
              <button
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                type="submit"
              >
                Join waitlist
              </button>
            </form>
          )}
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <h2 className="text-3xl font-black">Built for accounting data prep</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "CSV parsing and field mapping",
              "Data cleaning and validation",
              "Export and reporting workflows",
            ].map((item) => (
              <div className="rounded-lg border border-stone-200 p-5" key={item}>
                <p className="font-black">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {SITE_NAME} focuses on turning messy commerce exports into records
                  finance teams can review.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
