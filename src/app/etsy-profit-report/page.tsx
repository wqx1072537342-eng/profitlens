import type { Metadata } from "next";
import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";
import { absoluteUrl, faqJsonLd } from "@/lib/seo/site";

const faqs = [
  {
    question: "Do I need to connect my Etsy account?",
    answer:
      "No. ProfitLens is built for official Etsy CSV exports, so the beta does not require an Etsy account connection.",
  },
  {
    question: "Is the Excel download free?",
    answer:
      "Yes. During the current beta, Profit Preview and Excel workbook download are free by default.",
  },
  {
    question: "Is this tax advice?",
    answer:
      "No. ProfitLens prepares bookkeeping reports for review. It is not tax, legal, or accounting advice.",
  },
];

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/etsy-profit-report"),
  },
  description:
    "Upload Etsy CSV files and generate a CPA-ready Etsy profit report with revenue, refunds, fees, ads, shipping labels, tax notes, COGS, warnings, and Excel download.",
  openGraph: {
    description:
      "Turn Etsy CSV exports into a CPA-ready profit report without connecting your Etsy account.",
    title: "Etsy Profit Report from CSV",
    type: "website",
    url: absoluteUrl("/etsy-profit-report"),
  },
  title: "Etsy Profit Report from CSV",
  twitter: {
    card: "summary_large_image",
    description:
      "Turn Etsy CSV exports into a CPA-ready profit report without connecting your Etsy account.",
    title: "Etsy Profit Report from CSV",
  },
};

export default function EtsyProfitReportPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        type="application/ld+json"
      />
      <PublicHeader />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            Etsy profit report from your CSV exports.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Upload official Etsy CSV files and get a CPA-ready profit report covering
            revenue, refunds, Etsy fees, ads, shipping labels, tax collected, optional
            COGS, warnings, and source notes.
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
          <div className="mt-6 grid gap-2 text-sm font-semibold text-teal-900 sm:grid-cols-3">
            <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2">
              No Etsy account connection
            </span>
            <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2">
              Free preview
            </span>
            <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2">
              Excel download free in beta
            </span>
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Report sections
          </p>
          <div className="mt-5 grid gap-3">
            {[
              ["Revenue", "Gross sales and shipping charged to buyers."],
              ["Deductions", "Refunds, Etsy fees, ads, labels, and fee credits."],
              ["Tax notes", "Sales Tax, VAT, and GST shown outside net profit."],
              ["CPA handoff", "Workbook-style report built for bookkeeping review."],
            ].map(([title, body]) => (
              <div className="rounded-md border border-stone-200 bg-stone-50 p-4" key={title}>
                <h2 className="font-black text-slate-950">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
          {[
            [
              "Stop rebuilding Etsy spreadsheets by hand",
              "ProfitLens organizes CSV categories into a profit report instead of leaving you with scattered exports.",
            ],
            [
              "Show what is excluded from profit",
              "Marketplace-collected tax is shown clearly so sellers and CPAs do not treat it as seller profit.",
            ],
            [
              "Review warnings before sharing",
              "Missing files, unknown types, empty amounts, and currency issues are surfaced before report download.",
            ],
          ].map(([title, body]) => (
            <article className="rounded-lg border border-stone-200 p-5" key={title}>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-black">How the Etsy CSV workflow works</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The first version focuses on one job: turn Etsy CSV exports into a
              report a seller can review before sending it to a CPA.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Upload official Etsy CSV files",
              "Review detected file types and warnings",
              "Generate a Profit Preview",
              "Download the Excel workbook",
            ].map((step, index) => (
              <div className="rounded-md border border-stone-200 bg-white p-4" key={step}>
                <p className="text-sm font-black text-teal-800">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 font-bold text-slate-950">{step}</p>
              </div>
            ))}
          </div>
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
