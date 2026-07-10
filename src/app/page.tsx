import Link from "next/link";

import { PublicFooter, PublicHeader } from "@/features/marketing/public-site";

const dataSources = [
  ["Etsy", "Available"],
  ["Shopify", "Coming Soon"],
  ["Amazon", "Coming Soon"],
  ["Stripe", "Coming Soon"],
  ["PayPal", "Coming Soon"],
];

const destinations = [
  ["QuickBooks", "Coming Soon"],
  ["Xero", "Coming Soon"],
  ["Excel", "Available"],
  ["Google Sheets", "Coming Soon"],
  ["CSV", "Available"],
];

const workflow = [
  ["Upload your marketplace CSV", "Start with Etsy CSV files today. More commerce platforms are planned."],
  ["Let AI map and clean your data", "Normalize headers, field names, money values, dates, and transaction categories."],
  ["Review validation results", "See missing files, suspicious rows, duplicate risks, and completeness warnings."],
  ["Export accounting-ready records", "Download Excel reports now. QuickBooks and Xero exports are planned next."],
];

const features = [
  ["AI Field Mapping", "Map inconsistent marketplace CSV headers into accounting-ready fields."],
  ["Smart Data Cleaning", "Normalize dates, money values, categories, and file formats before export."],
  ["Transaction Validation", "Flag missing columns, incomplete files, suspicious rows, and tax handling notes."],
  ["Duplicate Detection", "Identify duplicate order and transaction risks before records reach accounting."],
  ["Accounting-Ready Export", "Prepare clean records for spreadsheets today and accounting systems next."],
  ["Profit and Fee Analysis", "Understand revenue, refunds, fees, ads, shipping labels, taxes, and profit."],
];

const useCases = [
  {
    body: "Clean and transform Etsy transaction data for QuickBooks.",
    label: "Available",
    title: "Etsy to QuickBooks",
  },
  {
    body: "Prepare Shopify orders, fees and refunds for accounting.",
    label: "Coming Soon",
    title: "Shopify to QuickBooks",
  },
  {
    body: "Convert Amazon settlement data into accounting-ready records.",
    label: "Coming Soon",
    title: "Amazon to QuickBooks",
  },
];

function StatusBadge({ status }: { status: string }) {
  const isAvailable = status === "Available";
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        isAvailable
          ? "border-teal-200 bg-teal-50 text-teal-900"
          : "border-stone-200 bg-stone-50 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <PublicHeader />

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-teal-800">
            AI Commerce Data Automation Platform
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight md:text-6xl">
            Turn marketplace data into accounting-ready records.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Import, map, validate and sync data from Etsy, Shopify, Amazon and more
            to QuickBooks, Xero or spreadsheets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
              href="/upload"
            >
              Start for Free
            </Link>
            <Link
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              href="/#how-it-works"
            >
              See How It Works
            </Link>
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500">
            No credit card required. Upload your first CSV for free.
          </p>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Data automation flow
          </p>
          <div className="mt-5 grid gap-3">
            {[
              ["Import", "Etsy CSV files"],
              ["Map", "Headers to accounting fields"],
              ["Validate", "Warnings and missing data"],
              ["Export", "Excel today, QuickBooks later"],
            ].map(([label, body]) => (
              <div
                className="rounded-md border border-stone-200 bg-stone-50 px-4 py-3"
                key={label}
              >
                <p className="text-sm font-black text-slate-950">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
            Etsy CSV analysis and Excel report download are available now. Other
            integrations are clearly marked Coming Soon.
          </p>
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white" id="integrations">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-800">
              Supported platforms
            </p>
            <h2 className="mt-2 text-3xl font-black">Data Sources</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {dataSources.map(([name, status]) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 p-4"
                  key={name}
                >
                  <span className="font-bold">{name}</span>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-teal-800">
              Export destinations
            </p>
            <h2 className="mt-2 text-3xl font-black">Destinations</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {destinations.map(([name, status]) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 p-4"
                  key={name}
                >
                  <span className="font-bold">{name}</span>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12" id="how-it-works">
        <h2 className="text-3xl font-black">How It Works</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {workflow.map(([title, body], index) => (
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm" key={title}>
              <span className="text-sm font-black text-teal-800">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white" id="features">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <h2 className="text-3xl font-black">Core Features</h2>
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

      <section className="mx-auto max-w-7xl px-5 py-12" id="product">
        <h2 className="text-3xl font-black">Use Cases</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {useCases.map((useCase) => (
            <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm" key={useCase.title}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-black">{useCase.title}</h3>
                <StatusBadge status={useCase.label} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{useCase.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white" id="resources">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black">Stop fixing marketplace CSV files manually.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Upload your data and let FlowSync AI prepare it for accounting.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
            href="/upload"
          >
            Start for Free
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
