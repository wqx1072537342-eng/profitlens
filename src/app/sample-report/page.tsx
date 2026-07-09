import type { Metadata } from "next";
import Link from "next/link";

import { absoluteUrl, faqJsonLd } from "@/lib/seo/site";

const summaryRows = [
  ["Gross Sales", "$12,480", "Orders CSV"],
  ["Refunds", "-$820", "Refunds CSV"],
  ["Etsy Fees", "-$1,240", "Fees CSV"],
  ["Ads", "-$430", "Etsy Ads / Offsite Ads CSV"],
  ["Shipping Labels", "-$860", "Shipping Labels CSV"],
  ["Sales Tax / VAT / GST", "$940", "Tax CSV, excluded from profit"],
  ["Net Profit Before COGS", "$7,920", "Calculated report result"],
  ["Net Profit After COGS", "$6,780", "Only if COGS is provided"],
];

const faqs = [
  {
    question: "Are these sample numbers from my shop?",
    answer:
      "No. The sample report uses illustrative numbers. Your report is generated only from the CSV files you upload.",
  },
  {
    question: "Can I download an Excel report?",
    answer:
      "Yes. In the current beta, ProfitLens supports Excel workbook download for generated reports.",
  },
  {
    question: "Can I send the report to my CPA?",
    answer:
      "The report is designed for bookkeeping preparation and CPA review, but you should verify it with your CPA before filing taxes.",
  },
];

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/sample-report"),
  },
  description:
    "Preview the ProfitLens sample Etsy profit report structure: revenue, refunds, Etsy fees, ads, shipping labels, tax notes, COGS, warnings, and Excel workbook handoff.",
  openGraph: {
    description:
      "Preview a CPA-ready Etsy profit report structure before uploading your CSV files.",
    title: "Sample Etsy Profit Report",
    type: "website",
    url: absoluteUrl("/sample-report"),
  },
  title: "Sample Etsy Profit Report",
  twitter: {
    card: "summary_large_image",
    description:
      "Preview a CPA-ready Etsy profit report structure before uploading your CSV files.",
    title: "Sample Etsy Profit Report",
  },
};

export default function SampleReportPage() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        type="application/ld+json"
      />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link className="text-lg font-black" href="/">
            ProfitLens
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link className="text-slate-600 transition hover:text-slate-950" href="/etsy-profit-report">
              Profit report
            </Link>
            <Link className="text-slate-600 transition hover:text-slate-950" href="/etsy-tax-report">
              Tax report
            </Link>
            <Link
              className="rounded-md bg-teal-700 px-4 py-2 text-white transition hover:bg-teal-800"
              href="/signup"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            Sample Etsy profit report for CPA review.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            See how ProfitLens organizes Etsy CSV exports into a report package with
            source notes, tax treatment, warnings, and Excel workbook sections.
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
              href="/pricing"
            >
              View pricing
            </Link>
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Example report summary
          </p>
          <div className="mt-5 grid gap-2">
            {summaryRows.slice(0, 5).map(([label, value, source]) => (
              <div
                className="flex items-start justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 p-3"
                key={label}
              >
                <div>
                  <p className="font-bold text-slate-950">{label}</p>
                  <p className="mt-1 text-xs text-slate-500">Source: {source}</p>
                </div>
                <p className="font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
            Sample numbers are illustrative. Your report uses your uploaded CSV rows.
          </p>
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-3xl font-black">What the workbook includes</h2>
          <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200">
            <table className="min-w-full border-collapse bg-white text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3">Sample value</th>
                  <th className="px-4 py-3">Source note</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map(([label, value, source]) => (
                  <tr className="border-b border-stone-100 last:border-0" key={label}>
                    <td className="px-4 py-4 font-bold text-slate-950">{label}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{value}</td>
                    <td className="px-4 py-4 text-slate-600">{source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-12 md:grid-cols-3">
        {[
          [
            "Source-backed categories",
            "Each amount points back to a CSV category so sellers and CPAs can review the origin.",
          ],
          [
            "Clear tax handling",
            "Sales Tax, VAT, GST, and marketplace-collected tax are shown outside net profit.",
          ],
          [
            "Warnings before handoff",
            "Missing files and parsing warnings are shown before the report is treated as complete.",
          ],
        ].map(([title, body]) => (
          <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" key={title}>
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
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
        </div>
      </section>
    </main>
  );
}
