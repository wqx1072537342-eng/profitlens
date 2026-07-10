import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";
import { absoluteUrl, faqJsonLd } from "@/lib/seo/site";

const faqs = [
  {
    question: "Can ProfitLens file my Etsy taxes?",
    answer:
      "No. ProfitLens does not file taxes and does not provide tax advice. It prepares bookkeeping reports you can review and share with a CPA.",
  },
  {
    question: "Does Sales Tax, VAT, or GST count as profit?",
    answer:
      "ProfitLens shows Sales Tax, VAT, GST, and marketplace-collected tax separately and excludes them from net profit.",
  },
  {
    question: "What CSV files should I upload for tax season?",
    answer:
      "Start with Etsy orders, refunds, fees, shipping labels, sales tax, deposits, ads, and any COGS information you have.",
  },
];

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/etsy-tax-report"),
  },
  description:
    "Prepare an Etsy tax season profit report from CSV exports. Organize revenue, refunds, Etsy fees, ads, shipping labels, tax collected, COGS, and warnings for CPA review.",
  openGraph: {
    description:
      "Prepare an Etsy tax season profit report from CSV exports for CPA review.",
    title: "Etsy Tax Report from CSV",
    type: "website",
    url: absoluteUrl("/etsy-tax-report"),
  },
  title: "Etsy Tax Report from CSV",
  twitter: {
    card: "summary_large_image",
    description:
      "Prepare an Etsy tax season profit report from CSV exports for CPA review.",
    title: "Etsy Tax Report from CSV",
  },
};

export default function EtsyTaxReportPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        type="application/ld+json"
      />
      <PublicHeader />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            Etsy tax season reports without spreadsheet chaos.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            ProfitLens helps Etsy sellers prepare a year-end profit report from CSV
            exports before sending numbers to a CPA. Organize sales, refunds, fees,
            ads, shipping labels, tax collected, and optional COGS in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
              href="/upload"
            >
              Upload Etsy CSV
            </Link>
            <Link
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              href="/sample-report"
            >
              View sample report
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-black">What the tax prep report clarifies</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["Revenue", "Gross sales and shipping charged to buyers."],
              ["Refunds", "Refunds and Etsy case refunds reduce the report result."],
              ["Fees", "Transaction, processing, ad, and label fees are grouped."],
              ["Tax collected", "Sales Tax, VAT, and GST are shown outside profit."],
              ["COGS", "Product, packaging, and fulfillment costs can be reviewed."],
            ].map(([title, body]) => (
              <div className="rounded-md border border-stone-200 bg-stone-50 p-4" key={title}>
                <h3 className="font-black text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-3xl font-black">Built for bookkeeping preparation</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "CPA-ready structure",
                "The report separates the categories a CPA usually needs to inspect instead of mixing everything into one CSV.",
              ],
              [
                "Tax treatment notes",
                "Marketplace-collected tax is visible but excluded from net profit so the report is easier to review.",
              ],
              [
                "Warnings before download",
                "ProfitLens highlights missing files and suspicious CSV fields before you rely on the report.",
              ],
            ].map(([title, body]) => (
              <article className="rounded-lg border border-stone-200 p-5" key={title}>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-black">Recommended Etsy CSV set</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You can still generate a report when files are missing, but the dashboard
            will show completeness warnings so you know what to add next.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Orders",
            "Refunds",
            "Fees",
            "Etsy Ads",
            "Offsite Ads",
            "Shipping Labels",
            "Sales Tax / VAT / GST",
            "Deposits",
            "COGS",
          ].map((fileType) => (
            <div className="rounded-md border border-stone-200 bg-white p-4" key={fileType}>
              <p className="font-bold text-slate-950">{fileType}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-3xl font-black">FAQ</h2>
          <div className="mt-6 grid gap-4">
            {faqs.map((faq) => (
              <article className="rounded-lg border border-stone-200 p-5" key={faq.question}>
                <h3 className="font-black text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            ProfitLens is bookkeeping preparation software. It is not tax, legal, or
            accounting advice.
          </p>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
