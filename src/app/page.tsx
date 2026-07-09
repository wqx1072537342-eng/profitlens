import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";

const trustItems = [
  "No Etsy password required",
  "No live Etsy account connection",
  "Official Etsy CSV exports",
  "Marketplace tax shown separately",
  "Built for CPA review",
];

const painPoints = [
  {
    body: "Transaction fees, processing fees, Offsite Ads, and shipping label costs are hard to reconcile by hand.",
    title: "Etsy fees are scattered",
  },
  {
    body: "Refunds, Etsy Ads, and label costs can make revenue look healthier than the real profit picture.",
    title: "Refunds and ads distort profit",
  },
  {
    body: "Sales Tax, VAT, GST, and marketplace-collected tax should be visible without inflating profit.",
    title: "Sales tax is confusing",
  },
  {
    body: "A CPA needs a clear profit package, not screenshots and scattered CSV exports.",
    title: "CPAs need clean numbers",
  },
];

const workflow = [
  ["Upload Etsy CSV files", "Choose official Etsy exports for the same tax year."],
  ["Review detected file types", "ProfitLens identifies orders, refunds, fees, ads, labels, taxes, and deposits."],
  ["Fix warnings or add missing files", "See what is incomplete before relying on the report."],
  ["Generate Profit Preview", "Review revenue, expenses, tax notes, and profit."],
  ["Download Excel report", "Use the workbook for bookkeeping preparation and CPA review."],
];

const sampleMetrics = [
  ["Gross Sales", "$12,480", "Orders CSV"],
  ["Refunds", "-$820", "Refunds CSV"],
  ["Etsy Fees", "-$1,240", "Fees CSV"],
  ["Ads", "-$430", "Ads CSV"],
  ["Shipping Labels", "-$860", "Shipping Labels CSV"],
  ["Sales Tax / VAT / GST", "$940", "Excluded from profit"],
  ["Net Profit Before COGS", "$7,920", "Calculated report result"],
  ["Net Profit After COGS", "$6,780", "When COGS is provided"],
];

const features = [
  ["CSV file type detection", "Identify Etsy orders, refunds, fees, ads, shipping labels, sales tax, deposits, and unknown files."],
  ["Profit Preview", "Show revenue, expenses, tax notes, and profit before download."],
  ["Data completeness checks", "Tell sellers which files are missing and how that affects the report."],
  ["COGS support", "Add product costs, packaging, and fulfillment costs when available."],
  ["Excel workbook download", "Download a report designed for bookkeeping preparation and CPA review."],
  ["Dashboard and report history", "Track uploaded files, generated reports, warnings, and downloads."],
];

const faqs = [
  ["Is ProfitLens tax advice?", "No. ProfitLens is bookkeeping preparation software, not tax, legal, or accounting advice."],
  ["Do I need to connect my Etsy account?", "No. ProfitLens works from official Etsy CSV exports and does not require Etsy account connection in the current beta."],
  ["Which Etsy CSV files are supported?", "Orders, refunds, fees, Etsy Ads, Offsite Ads, shipping labels, sales tax, deposits, and optional COGS files."],
  ["What happens if I do not upload every file?", "ProfitLens can still generate a preview and will show missing file warnings so you know what is incomplete."],
  ["How is Sales Tax / VAT / GST handled?", "Marketplace-collected tax is shown separately and excluded from net profit."],
  ["Is Excel download free?", "Yes. Excel download is free during the current beta."],
  ["Can I send the report to my CPA?", "Yes, the report is designed for CPA review, but you should verify it with your CPA before filing taxes."],
  ["Is my data stored?", "ProfitLens stores uploaded metadata and report data needed to generate your report. Data deletion requests can be sent to support."],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <PublicHeader />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            Upload Etsy CSV files and get a CPA-ready profit report.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            ProfitLens helps Etsy sellers turn official CSV exports into a clean
            profit report with revenue, refunds, fees, ads, shipping labels, tax
            notes, COGS, warnings, and Excel download.
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
          <p className="mt-5 text-sm font-semibold text-slate-500">
            For Etsy sellers preparing tax-season bookkeeping. Bookkeeping
            preparation, not tax advice.
          </p>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Report preview
          </p>
          <div className="mt-5 grid gap-2">
            {sampleMetrics.slice(0, 5).map(([label, value, source]) => (
              <div
                className="flex items-start justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2"
                key={label}
              >
                <div>
                  <p className="text-sm font-bold text-slate-950">{label}</p>
                  <p className="mt-1 text-xs text-slate-500">Source: {source}</p>
                </div>
                <p className="text-sm font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
            Sample numbers are illustrative. Your report is generated only from the
            CSV files you upload.
          </p>
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-3 px-5 py-6 md:grid-cols-5">
          {trustItems.map((item) => (
            <div className="rounded-md border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-950" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black">Tax season should not mean rebuilding your Etsy business by hand.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            ProfitLens focuses on the messy bookkeeping work Etsy sellers face before
            sending numbers to a CPA.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {painPoints.map((point) => (
            <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" key={point.title}>
              <h3 className="text-xl font-black">{point.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white" id="how-it-works">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black">How it works</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Upload multiple Etsy CSV files. If a file is missing, ProfitLens still
                generates a preview and shows what is incomplete.
              </p>
            </div>
            <Link className="text-sm font-bold text-teal-800 transition hover:text-teal-900" href="/etsy-profit-report">
              See product details
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {workflow.map(([title, body], index) => (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4" key={title}>
                <span className="text-sm font-black text-teal-800">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-3xl font-black">Sample report preview</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The workbook separates seller revenue, platform expenses, marketplace
            tax, optional COGS, and warnings so the report is easier to review.
          </p>
          <Link
            className="mt-5 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            href="/sample-report"
          >
            View full sample report
          </Link>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {sampleMetrics.map(([label, value, source]) => (
              <div className="rounded-md border border-stone-200 bg-stone-50 p-4" key={label}>
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-2 text-xs text-slate-500">{source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-3xl font-black">Core features for the first version</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {features.map(([title, body]) => (
              <article className="rounded-lg border border-stone-200 p-5" key={title}>
                <h3 className="text-lg font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-3xl font-black">Your Etsy account stays private.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            ProfitLens does not ask for your Etsy password and does not connect to
            your Etsy account. The current beta works from CSV files you choose to
            upload.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "No Etsy login required",
            "No Etsy API connection",
            "CSV data is used to generate your report",
            "Data deletion requests can be sent to support",
          ].map((item) => (
            <div className="rounded-md border border-stone-200 bg-white p-4 text-sm font-bold text-slate-800 shadow-sm" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-3xl font-black">Start free while ProfitLens is in beta.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Free Beta", "$0", "CSV upload, Profit Preview, Excel download."],
              ["One-Time Report", "$19/report", "Coming Soon. Built for tax-season cleanup."],
              ["Pro", "$19/month", "Coming Soon. Recurring Etsy profit reporting."],
            ].map(([name, price, body]) => (
              <article className="rounded-lg border border-stone-200 p-5" key={name}>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-800">{name}</p>
                <p className="mt-3 text-3xl font-black text-slate-950">{price}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            Paid plans are not active yet. Downloads are free during the current MVP beta.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12" id="faq">
        <h2 className="text-3xl font-black">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" key={question}>
              <h3 className="font-black text-slate-950">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black">Have a CSV that does not import correctly?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Send us the issue and help shape the first paid version for Etsy sellers.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
            href="/contact"
          >
            Contact support
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
