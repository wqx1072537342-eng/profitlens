import Link from "next/link";
import { redirect } from "next/navigation";

import { loadDashboardSummary } from "@/features/dashboard/summary";
import { DeleteReportButton } from "@/features/reports/delete-report-button";
import { getCurrentUser } from "@/features/auth/session";
import {
  dashboardFileTypeLabel,
  type DashboardCompleteness,
  type DashboardNextBestAction,
  type DashboardReportItem,
  type DashboardSummary,
  type DashboardUploadBatchItem,
} from "@/lib/dashboard/dashboardSummary";

export const dynamic = "force-dynamic";

function formatMoney(value: number | null, currency: string | null) {
  if (value === null || !currency) return "No report yet";

  try {
    return new Intl.NumberFormat("en-US", {
      currency,
      style: "currency",
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function formatPercent(value: number | null) {
  if (value === null) return "No report yet";
  return `${value.toFixed(1)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function statusTone(status: string) {
  if (status === "complete") return "border-teal-200 bg-teal-50 text-teal-900";
  if (status === "partial") return "border-amber-200 bg-amber-50 text-amber-900";
  if (status === "limited") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function KpiCard({
  label,
  source,
  value,
}: {
  label: string;
  source: string;
  value: string | number;
}) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Source: {source}
      </p>
    </article>
  );
}

function EmptyDashboardState() {
  return (
    <section className="rounded-lg border border-dashed border-teal-300 bg-teal-50 p-6 text-teal-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black">Start with your first Etsy CSV batch</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6">
            Upload official Etsy CSV exports to unlock real KPIs, file completeness,
            warnings, Profit Preview, report history, and Excel downloads. No sample
            numbers are shown on this dashboard.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          href="/upload"
        >
          Upload Etsy CSV
        </Link>
      </div>
    </section>
  );
}

function NextBestAction({ action }: { action: DashboardNextBestAction }) {
  const tone =
    action.tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : action.tone === "primary"
        ? "border-teal-200 bg-teal-50 text-teal-950"
        : "border-stone-200 bg-white text-slate-950";
  const buttonTone =
    action.tone === "warning"
      ? "bg-amber-700 text-white hover:bg-amber-800"
      : action.tone === "primary"
        ? "bg-teal-700 text-white hover:bg-teal-800"
        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <section className={`rounded-lg border p-6 shadow-sm ${tone}`}>
      <p className="text-sm font-semibold uppercase tracking-wide opacity-75">
        Next Best Action
      </p>
      <h2 className="mt-2 text-2xl font-black">{action.title}</h2>
      <p className="mt-3 text-sm leading-6">{action.body}</p>
      <Link
        className={`mt-5 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${buttonTone}`}
        href={action.href}
      >
        {action.cta}
      </Link>
    </section>
  );
}

function DataCompleteness({ completeness }: { completeness: DashboardCompleteness }) {
  const includedCount = completeness.items.filter(
    (item) => item.status === "included",
  ).length;
  const percent =
    completeness.items.length > 0
      ? Math.round((includedCount / completeness.items.length) * 100)
      : 0;
  const missingRequiredCount = completeness.items.filter(
    (item) => item.required && item.status === "missing",
  ).length;

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Data completeness
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {completeness.label}
          </h2>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
            completeness.status,
          )}`}
        >
          {percent}% covered
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-teal-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Source:{" "}
        {completeness.source === "report"
          ? "latest reports row"
          : completeness.source === "upload"
            ? "latest upload batch and uploads rows"
            : "no uploaded data yet"}
        . {missingRequiredCount} required file type
        {missingRequiredCount === 1 ? "" : "s"} missing.
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {completeness.items.map((item) => (
          <div
            className="flex items-start justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2"
            key={item.fileType}
          >
            <div>
              <p className="text-sm font-bold text-slate-950">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                {item.required ? "Required" : "Optional"}
              </p>
            </div>
            <span
              className={`rounded-full border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
                item.status === "included"
                  ? "border-teal-200 bg-teal-50 text-teal-900"
                  : "border-stone-200 bg-white text-slate-500"
              }`}
            >
              {item.status === "included" ? "Included" : "Missing"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LatestReportBreakdown({ report }: { report: DashboardReportItem | null }) {
  if (!report) {
    return (
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Latest report breakdown
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">No report yet</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Generate a Profit Preview to see revenue, refunds, Etsy fees, ads, shipping
          labels, tax collected, and net profit from real report rows.
        </p>
      </section>
    );
  }

  const rows = [
    ["Gross Sales", report.grossSales],
    ["Refunds", report.refunds],
    ["Etsy Fees", report.fees],
    ["Ads", report.ads],
    ["Shipping Labels", report.shipping],
    ["Sales Tax / VAT / GST", report.taxCollected],
    ["Net Profit Before COGS", report.netProfitBeforeCOGS],
    ["Net Profit After COGS", report.netProfitAfterCOGS],
  ] as const;

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Latest report breakdown
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {formatDate(report.createdAt)}
          </h2>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          href={`/reports/${report.id}`}
        >
          Open report
        </Link>
      </div>

      <div className="mt-5 grid gap-2">
        {rows.map(([label, value]) => (
          <div
            className="flex items-center justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm"
            key={label}
          >
            <span className="font-semibold text-slate-600">{label}</span>
            <span className="font-bold text-slate-950">
              {formatMoney(value, report.currency)}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
        Tax collected is shown for CPA review and is excluded from profit. Profit
        After COGS depends on whether product costs were uploaded.
      </p>
    </section>
  );
}

function RecentReports({ reports }: { reports: DashboardReportItem[] }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-stone-200 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent reports
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Latest Profit Previews
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Source: reports and download_events rows for your account.
          </p>
        </div>
        <Link
          className="text-sm font-bold text-teal-800 transition hover:text-teal-900"
          href="/reports"
        >
          View all reports
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="p-6">
          <p className="text-sm font-semibold text-slate-950">No reports yet.</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Upload Etsy CSV files and generate a Profit Preview to create report
            history.
          </p>
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
                <th className="px-4 py-3">Warnings</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr className="border-b border-stone-100 last:border-0" key={report.id}>
                  <td className="px-4 py-4 font-semibold text-slate-950">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                        report.completenessStatus,
                      )}`}
                    >
                      {report.completenessLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {formatMoney(report.grossSales, report.currency)}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {formatMoney(report.netProfitBeforeCOGS, report.currency)}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {report.warningCount}
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {report.downloadCount}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
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
                        Download
                      </a>
                      <DeleteReportButton reportId={report.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LatestUploadBatch({ batch }: { batch: DashboardUploadBatchItem | null }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Latest upload batch
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            {batch ? `${batch.fileCount} CSV files` : "No upload batch yet"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Source: upload_batches and uploads rows.
          </p>
        </div>
        <Link
          className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          href="/upload"
        >
          Add CSV files
        </Link>
      </div>

      {!batch ? (
        <p className="mt-5 rounded-md border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-slate-600">
          Upload official Etsy CSV files to create the first batch.
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p className="mt-1 font-black text-slate-950">{batch.status}</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Warnings
              </p>
              <p className="mt-1 font-black text-slate-950">{batch.warningCount}</p>
            </div>
            <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Created
              </p>
              <p className="mt-1 font-black text-slate-950">
                {formatDate(batch.createdAt)}
              </p>
            </div>
          </div>

          {batch.files.length === 0 ? (
            <p className="rounded-md border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-slate-600">
              This batch has no saved upload rows.
            </p>
          ) : (
            <div className="grid gap-2">
              {batch.files.slice(0, 6).map((file) => (
                <div
                  className="flex flex-col gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  key={file.id}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-950">{file.fileName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {dashboardFileTypeLabel(file.fileType)} / {file.rowCount} rows
                    </p>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {file.warningCount} warnings
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function DashboardContent({ summary }: { summary: DashboardSummary }) {
  const currency = summary.metrics.latestCurrency;

  return (
    <div className="grid gap-6">
      {!summary.hasAnyData ? <EmptyDashboardState /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Latest Gross Sales"
          source="latest reports row"
          value={formatMoney(summary.metrics.latestGrossSales, currency)}
        />
        <KpiCard
          label="Profit Before COGS"
          source="latest reports row"
          value={formatMoney(summary.metrics.latestNetProfitBeforeCOGS, currency)}
        />
        <KpiCard
          label="Profit Margin"
          source="latest reports row"
          value={formatPercent(summary.metrics.latestProfitMargin)}
        />
        <KpiCard
          label="Uploaded CSV Files"
          source="uploads rows"
          value={summary.metrics.totalUploadedFiles}
        />
        <KpiCard
          label="Excel Downloads"
          source="download_events rows"
          value={summary.metrics.totalDownloads}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <NextBestAction action={summary.nextBestAction} />
        <DataCompleteness completeness={summary.completeness} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <LatestReportBreakdown report={summary.latestReport} />
        <LatestUploadBatch batch={summary.latestUploadBatch} />
      </section>

      <RecentReports reports={summary.recentReports} />
    </div>
  );
}

export default async function DashboardPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  const result = await loadDashboardSummary();

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              ProfitLens dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Etsy profit workspace
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Signed in as <span className="font-semibold">{user.email}</span>. This
              dashboard uses only your saved Etsy CSV uploads, generated reports, and
              download events.
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

      {result.status === "error" ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Dashboard data could not be loaded: {result.message}
        </section>
      ) : null}

      <DashboardContent summary={result.summary} />
    </div>
  );
}
