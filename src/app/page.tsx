import Link from "next/link";

const painPoints = [
  {
    title: "Tax season is messy",
    body: "Etsy sellers need to reconcile orders, refunds, labels, fees, ads, and deposits before sending numbers to a CPA.",
  },
  {
    title: "Fees are hard to explain",
    body: "Transaction fees, processing fees, offsite ads, shipping labels, and credits need clean source-backed categories.",
  },
  {
    title: "Tax collected is confusing",
    body: "Sales Tax, VAT, GST, and marketplace-collected tax should be shown clearly without inflating profit.",
  },
];

const workflow = [
  "Upload Etsy CSV",
  "Review warnings",
  "Add optional COGS",
  "Preview profit",
  "Download report",
];

const sampleMetrics = [
  ["Gross Sales", "$12,480"],
  ["Etsy Fees", "-$1,240"],
  ["Shipping Labels", "-$860"],
  ["Tax Collected", "$940"],
  ["Profit Before COGS", "$7,920"],
];

export default function Page() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link className="text-lg font-black" href="/">
            Etsy Profit Report by ProfitLens
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link className="text-slate-600 transition hover:text-slate-950" href="/pricing">
              Pricing
            </Link>
            <Link className="text-slate-600 transition hover:text-slate-950" href="/login">
              Log in
            </Link>
            <Link
              className="rounded-md bg-teal-700 px-4 py-2 text-white transition hover:bg-teal-800"
              href="/signup"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-bold uppercase text-teal-800">
            Etsy Profit Report by ProfitLens
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight md:text-6xl">
            Upload Etsy CSV files and get a CPA-ready profit report.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            ProfitLens helps small Etsy sellers turn official CSV exports into a
            clear profit package covering revenue, refunds, fees, ads, shipping,
            marketplace tax, COGS, warnings, and source notes.
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
          <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold text-teal-900">
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
              No Etsy account connection
            </span>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
              Free preview
            </span>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
              Default MVP download is free
            </span>
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-500">Report package</p>
          <h2 className="mt-2 text-3xl font-black">Etsy Profit Report</h2>
          <div className="mt-6 grid gap-3">
            {[
              ["Revenue", "Orders CSV and shipping charged to buyers"],
              ["Deductions", "Refunds, Etsy fees, ads, labels, and adjustments"],
              ["Tax notes", "Sales Tax / VAT / GST shown outside profit"],
              ["CPA handoff", "Download a multi-sheet .xlsx workbook"],
            ].map(([label, body]) => (
              <div className="rounded-md border border-stone-200 p-4" key={label}>
                <strong className="block text-slate-950">{label}</strong>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  {body}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
            Built for bookkeeping preparation and CPA review. This is not tax,
            legal, or accounting advice.
          </p>
        </aside>
      </section>

      <section className="border-y border-stone-200 bg-white" id="sample-report">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase text-teal-800">Sample report</p>
            <h2 className="mt-2 text-3xl font-black">See the report shape before uploading</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A ProfitLens report separates seller revenue, platform expenses, shipping
              labels, marketplace-collected tax, optional COGS, and warnings so you can
              review the numbers before sending them to a CPA.
            </p>
            <Link
              className="mt-5 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              href="/sample-report"
            >
              Open full sample report
            </Link>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {sampleMetrics.map(([label, value]) => (
                <div className="rounded-md border border-stone-200 bg-white p-4" key={label}>
                  <p className="text-sm font-semibold text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Sample numbers are illustrative. Your report is generated only from the
              CSV files you upload.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Etsy seller resources
          </p>
          <h2 className="mt-2 text-3xl font-black">Prepare your Etsy profit report</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              [
                "/etsy-profit-report",
                "Etsy Profit Report",
                "Turn Etsy CSV exports into a CPA-ready profit report.",
              ],
              [
                "/etsy-tax-report",
                "Etsy Tax Report",
                "Prepare year-end bookkeeping numbers before CPA review.",
              ],
              [
                "/sample-report",
                "Sample Report",
                "Preview the report structure before uploading CSV files.",
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
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-10 md:grid-cols-3">
          {painPoints.map((point) => (
            <article className="rounded-lg border border-stone-200 p-5" key={point.title}>
              <h3 className="text-lg font-black">{point.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-teal-800">MVP workflow</p>
            <h2 className="mt-2 text-3xl font-black">Built around one seller task</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Help an Etsy seller upload official CSV files, understand profit, and
            download a CPA-ready report without connecting their Etsy account.
          </p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {workflow.map((step, index) => (
            <div className="rounded-lg border border-stone-200 bg-white p-4" key={step}>
              <span className="text-sm font-black text-teal-800">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong className="mt-3 block text-slate-950">{step}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
