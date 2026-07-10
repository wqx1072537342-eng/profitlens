import type { Metadata } from "next";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
  description:
    "FlowSync AI terms of service for the Etsy CSV profit report beta, including bookkeeping preparation limits and no tax advice.",
  title: "Terms of Service",
};

const sections = [
  [
    "Beta product status",
    "FlowSync AI is currently a beta product. Features, pricing, exports, and availability may change as the product improves.",
  ],
  [
    "Bookkeeping preparation only",
    "FlowSync AI provides reports for bookkeeping preparation and informational review. It is not tax, legal, or accounting advice.",
  ],
  [
    "User responsibility",
    "You are responsible for reviewing uploaded data, generated reports, warnings, and all numbers with a qualified professional before filing taxes.",
  ],
  [
    "Uploaded data",
    "You are responsible for ensuring that uploaded CSV files are yours to use and are accurate for the reporting period you are reviewing.",
  ],
  [
    "Free beta and future pricing",
    "Downloads are free during the current beta. Paid report or subscription options may be introduced later.",
  ],
  [
    "Service availability",
    "FlowSync AI may be unavailable during maintenance, product changes, provider outages, or beta updates.",
  ],
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <PublicHeader />
      <section className="mx-auto max-w-4xl px-5 py-14">
        <h1 className="text-5xl font-black leading-tight">Terms of Service</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          These terms describe the current FlowSync AI beta and the limits of the Etsy
          CSV profit reporting workflow.
        </p>
        <div className="mt-8 grid gap-4">
          {sections.map(([title, body]) => (
            <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm" key={title}>
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </section>
          ))}
        </div>
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          Contact: support@flowsyncdata.com
        </p>
      </section>
      <PublicFooter />
    </main>
  );
}
