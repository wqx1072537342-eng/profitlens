import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/pricing"),
  },
  description:
    "FlowSync AI pricing for Etsy sellers. Start with the free beta for Etsy CSV Profit Preview and Excel report downloads. Paid report and Pro plans are coming soon.",
  openGraph: {
    description:
      "Start free with FlowSync AI beta for Etsy CSV Profit Preview and Excel report downloads.",
    title: "FlowSync AI Pricing",
    type: "website",
    url: absoluteUrl("/pricing"),
  },
  title: "FlowSync AI Pricing",
  twitter: {
    card: "summary_large_image",
    description:
      "Start free with FlowSync AI beta for Etsy CSV Profit Preview and Excel report downloads.",
    title: "FlowSync AI Pricing",
  },
};

const plans = [
  {
    cta: "Start Free",
    ctaHref: "/signup",
    description:
      "For Etsy sellers who want to test FlowSync AI with real CSV files before paying.",
    features: [
      "Upload multiple Etsy CSV files",
      "CSV type detection and warnings",
      "Profit Preview",
      "Excel workbook download during beta",
    ],
    label: "Available now",
    name: "Free Beta",
    price: "$0",
  },
  {
    cta: "Join interest list",
    ctaHref:
      "mailto:support@flowsyncdata.com?subject=FlowSync AI%20One-Time%20Report%20Interest",
    description:
      "A future paid report package for sellers who only need tax-season cleanup.",
    features: [
      "One Etsy shop report",
      "CPA-ready Excel/PDF package",
      "Source notes by CSV category",
      "No monthly subscription required",
    ],
    label: "Coming Soon",
    name: "One-Time Report",
    price: "$19",
  },
  {
    cta: "Join waitlist",
    ctaHref: "mailto:support@flowsyncdata.com?subject=FlowSync AI%20Pro%20Waitlist",
    description:
      "A later SaaS plan for sellers who want recurring profit tracking and deeper analysis.",
    features: [
      "Unlimited Etsy report previews",
      "Advanced dashboard insights",
      "COGS workflow improvements",
      "Priority export features",
    ],
    label: "Coming Soon",
    name: "Pro",
    price: "$19/mo",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <PublicHeader />

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wide text-teal-800">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
            Simple pricing. Start free while FlowSync AI is in beta.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            FlowSync AI is Etsy-first. The current MVP keeps CSV upload, Profit
            Preview, and Excel download free while we validate what sellers and CPAs
            need most.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          No Stripe or paid checkout is connected yet. Paid report and subscription
          options are shown only to learn demand before we add payment gates.
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className="flex min-h-full flex-col rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
              key={plan.name}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-800">
                    {plan.name}
                  </p>
                  <p className="mt-3 text-4xl font-black text-slate-950">
                    {plan.price}
                  </p>
                </div>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-600">
                  {plan.label}
                </span>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">{plan.description}</p>
              <ul className="mt-6 grid gap-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li className="flex gap-2" key={feature}>
                    <span className="font-black text-teal-800">+</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                className={`mt-6 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition ${
                  plan.name === "Free Beta"
                    ? "bg-teal-700 text-white hover:bg-teal-800"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                href={plan.ctaHref}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-10 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            MVP billing policy
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Downloads are free by default in the current MVP.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            The first revenue experiment will happen only after the Etsy CSV workflow is
            stable enough for real sellers. For now, the product goal is activation:
            help users upload files, review warnings, generate a report, and tell us
            what would make it worth paying for.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Before you choose
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            See what the Etsy CSV report includes
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              [
                "/etsy-profit-report",
                "Etsy Profit Report",
                "Review the CPA-ready profit report workflow.",
              ],
              [
                "/etsy-tax-report",
                "Etsy Tax Report",
                "Understand tax-season bookkeeping preparation.",
              ],
              [
                "/sample-report",
                "Sample Report",
                "Preview the report format and source notes.",
              ],
            ].map(([href, title, body]) => (
              <Link
                className="rounded-md border border-stone-200 bg-stone-50 p-4 transition hover:bg-white"
                href={href}
                key={href}
              >
                <strong className="block text-slate-950">{title}</strong>
                <span className="mt-2 block text-sm leading-6 text-slate-600">
                  {body}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </section>
      <PublicFooter />
    </main>
  );
}
