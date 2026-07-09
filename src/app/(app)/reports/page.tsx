import Link from "next/link";
import { redirect } from "next/navigation";

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
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "complete"
      ? "border-teal-200 bg-teal-50 text-teal-900"
      : status === "partial"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tone}`}>
      {completenessLabel(status)}
    </span>
  );
}

function ReportRow({ report }: { report: ReportHistoryItem }) {
  return (
    <tr className="border-b border-stone-100 align-top last:border-0">
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-950">{formatDate(report.createdAt)}</p>
        <p className="mt-1 text-xs text-slate-500">{report.id}</p>
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={report.completenessStatus} />
      </td>
      <td className="px-4 py-4 font-semibold text-slate-800">
        {formatMoney(report.grossSales, report.currency)}
      </td>
      <td className="px-4 py-4 font-semibold text-slate-800">
        {formatMoney(report.netProfitBeforeCOGS, report.currency)}
      </td>
      <td className="px-4 py-4 font-semibold text-slate-800">
        {formatMoney(report.netProfitAfterCOGS, report.currency)}
      </td>
      <td className="px-4 py-4 text-sm text-slate-600">
        <p>{report.warningCount} warnings</p>
        <p className="mt-1">{report.downloadCount} downloads</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <Link
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            href={`/reports/${report.id}`}
          >
            View Report
          </Link>
          <a
            className="inline-flex items-center justify-center rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            href={`/reports/${report.id}/download`}
          >
            Download Excel
          </a>
          <DeleteReportButton reportId={report.id} />
        </div>
      </td>
    </tr>
  );
}

export default async function ReportsPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  const reports = await loadReportHistory();

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              Report History
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Your Etsy profit reports
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Reopen Profit Preview reports and download the .xlsx workbook again.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            href="/upload"
          >
            Upload CSV
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        {reports.length === 0 ? (
          <div className="p-6">
            <h2 className="text-xl font-black text-slate-950">No reports yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Upload Etsy CSV files and generate a Profit Preview to create your first
              report.
            </p>
            <Link
              className="mt-4 inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              href="/upload"
            >
              Start Upload
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Completeness</th>
                  <th className="px-4 py-3">Gross Sales</th>
                  <th className="px-4 py-3">Profit Before COGS</th>
                  <th className="px-4 py-3">Profit After COGS</th>
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
