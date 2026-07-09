import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/features/auth/session";
import { DeleteReportButton } from "@/features/reports/delete-report-button";
import { loadReportHistory } from "@/features/reports/history";
import { completenessLabel } from "@/lib/reports/batchCompleteness";
import type { ReportHistoryItem } from "@/lib/reports/reportHistory";

export const dynamic = "force-dynamic";

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      currency,
      style: "currency",
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function RecentReportCard({ report }: { report: ReportHistoryItem }) {
  return (
    <article className="rounded-md border border-stone-200 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-slate-950">{formatDate(report.createdAt)}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
            {completenessLabel(report.completenessStatus)} / {report.warningCount} warnings
          </p>
        </div>
        <p className="text-sm font-bold text-teal-800">
          {report.downloadCount} downloads
        </p>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Gross sales</span>
          <span className="font-semibold text-slate-950">
            {formatMoney(report.grossSales, report.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Profit before COGS</span>
          <span className="font-semibold text-slate-950">
            {formatMoney(report.netProfitBeforeCOGS, report.currency)}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          href={`/reports/${report.id}`}
        >
          View
        </Link>
        <a
          className="inline-flex items-center justify-center rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          href={`/reports/${report.id}/download`}
        >
          Download Excel
        </a>
        <DeleteReportButton reportId={report.id} />
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  const recentReports = await loadReportHistory(5);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              ProfitLens dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Welcome to ProfitLens
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Signed in as <span className="font-semibold">{user.email}</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              href="/upload"
            >
              Upload CSV
            </Link>
            <Link
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href="/reports"
            >
              Reports
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            MVP workflow
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Upload, preview, and free Excel workbook downloads are ready
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-stone-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Authentication</p>
            <p className="mt-2 text-lg font-black text-teal-800">Enabled</p>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Upload</p>
            <p className="mt-2 text-lg font-black text-teal-800">CSV preview</p>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Reports</p>
            <p className="mt-2 text-lg font-black text-teal-800">History + downloads</p>
          </div>
        </div>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          ProfitLens currently supports CSV file selection, metadata saving, file type
          recognition, Profit Preview, report history, and real .xlsx workbook
          downloads. PDF, Stripe, subscriptions, and Etsy API connections remain out of
          scope.
        </p>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Recent reports
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Continue from your latest Profit Previews
            </h2>
          </div>
          <Link
            className="text-sm font-bold text-teal-800 transition hover:text-teal-900"
            href="/reports"
          >
            View all reports
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold text-slate-950">No reports yet.</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Upload Etsy CSV files and generate a Profit Preview to create your first
              report.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {recentReports.map((report) => (
              <RecentReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
