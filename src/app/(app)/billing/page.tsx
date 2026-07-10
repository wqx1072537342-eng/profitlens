import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";
import { loadReportHistory } from "@/features/reports/history";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  const reports = await loadReportHistory();
  const downloadCount = reports.reduce((total, report) => total + report.downloadCount, 0);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Billing
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Free Beta plan
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          FlowSync AI currently does not charge for Etsy CSV Profit Preview or Excel
          downloads. Stripe is intentionally not connected in this sprint.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Current plan</p>
          <p className="mt-2 text-3xl font-black text-teal-800">Free Beta</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            CSV upload, Profit Preview, and workbook download are available now.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Reports generated</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{reports.length}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Reports are generated from Etsy CSV batches.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Excel downloads</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{downloadCount}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Download tracking is used for product learning, not billing.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Upgrade options
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Paid plans are Coming Soon
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              The planned pricing experiments are a $19 one-time report and a $19/mo
              Pro plan. They will stay disabled until the Etsy CSV workflow is ready
              for real paid customers.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/pricing"
          >
            View pricing
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-stone-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-slate-950">One-Time Report</p>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-600">
                Coming Soon
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A future tax-season package for sellers who only need one CPA-ready
              report.
            </p>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-slate-950">Pro Plan</p>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-600">
                Coming Soon
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A future subscription for recurring Etsy profit analysis and richer
              reporting.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <p className="text-sm font-semibold">
          Downloads remain free in the current MVP. This page is a billing preview,
          not a payment screen.
        </p>
      </section>
    </div>
  );
}
