import { redirect } from "next/navigation";

import { loadAdminUsageDashboard } from "@/features/admin/usage";

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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function PercentCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value.toFixed(1)}%</p>
    </div>
  );
}

export default async function AdminPage() {
  const result = await loadAdminUsageDashboard();

  if (result.status === "unauthorized") {
    redirect("/dashboard");
  }

  if (result.status === "error") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <p className="text-sm font-semibold uppercase">Admin setup needed</p>
        <h1 className="mt-2 text-2xl font-black">Usage dashboard is not ready</h1>
        <p className="mt-3 text-sm leading-6">{result.message}</p>
      </div>
    );
  }

  const { dashboard } = result;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Admin Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Customer usage and conversion
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Track whether sellers are completing the core 1.0 path: signup, upload,
          report generation, and Excel download.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
        <MetricCard label="Total users" value={dashboard.metrics.totalUsers} />
        <MetricCard
          label="Upload batches"
          value={dashboard.metrics.totalUploadBatches}
        />
        <MetricCard
          label="Uploaded files"
          value={dashboard.metrics.totalUploadedFiles}
        />
        <MetricCard label="Reports" value={dashboard.metrics.totalReports} />
        <MetricCard label="Downloads" value={dashboard.metrics.totalDownloads} />
        <MetricCard
          label="Users with report"
          value={dashboard.metrics.usersWithAtLeastOneReport}
        />
        <MetricCard
          label="Users with download"
          value={dashboard.metrics.usersWithAtLeastOneDownload}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Users with upload"
          value={dashboard.metrics.usersWithAtLeastOneUpload}
        />
        <MetricCard label="High-intent users" value={dashboard.metrics.highIntentUsers} />
        <MetricCard
          label="Reports with warnings"
          value={dashboard.metrics.reportsWithWarnings}
        />
        <PercentCard
          label="Warning rate"
          value={dashboard.metrics.reportWarningRate}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <PercentCard
          label="Signup to upload"
          value={dashboard.metrics.signupToUploadRate}
        />
        <PercentCard
          label="Upload to report"
          value={dashboard.metrics.uploadToReportRate}
        />
        <PercentCard
          label="Report to download"
          value={dashboard.metrics.reportToDownloadRate}
        />
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Core conversion funnel
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Signup to Excel download
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use this to judge whether users are reaching the first value moment and
              getting close to paid intent.
            </p>
          </div>
          <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-bold text-teal-950">
            {dashboard.metrics.downloadsLast30Days} downloads in 30 days
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {dashboard.conversionFunnel.map((step, index) => (
            <div className="rounded-md border border-stone-200 bg-stone-50 p-4" key={step.label}>
              <p className="text-sm font-black text-teal-800">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-black text-slate-950">{step.label}</h3>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {step.userCount}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {step.conversionRate.toFixed(1)}% conversion
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">New users</p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {dashboard.metrics.newUsersLast7Days}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {dashboard.metrics.newUsersLast30Days} in 30 days
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Reports generated</p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {dashboard.metrics.reportsLast7Days}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {dashboard.metrics.reportsLast30Days} in 30 days
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Excel downloads</p>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {dashboard.metrics.downloadsLast7Days}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {dashboard.metrics.downloadsLast30Days} in 30 days
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            High-intent users
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Users closest to paying
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These users uploaded CSV files, generated a report, and downloaded Excel.
            Contact them first for a $19 report validation conversation.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Uploads</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3">Warnings</th>
                <th className="px-4 py-3">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.highIntentUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-600" colSpan={6}>
                    No high-intent users yet.
                  </td>
                </tr>
              ) : (
                dashboard.highIntentUsers.map((user) => (
                  <tr className="border-b border-stone-100 last:border-0" key={user.userId}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{user.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Signed up {formatDate(user.signupAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {user.uploadBatchCount} batches / {user.uploadFileCount} files
                    </td>
                    <td className="px-4 py-4 text-slate-700">{user.reportCount}</td>
                    <td className="px-4 py-4 text-slate-700">{user.downloadCount}</td>
                    <td className="px-4 py-4 text-slate-700">{user.warningCount}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {formatDate(user.lastActivityAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent reports
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Latest generated Profit Previews
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Gross Sales</th>
                <th className="px-4 py-3">Net Profit</th>
                <th className="px-4 py-3">Warnings</th>
                <th className="px-4 py-3">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentReports.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-600" colSpan={6}>
                    No reports yet.
                  </td>
                </tr>
              ) : (
                dashboard.recentReports.map((report) => (
                  <tr className="border-b border-stone-100 last:border-0" key={report.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">{report.userEmail}</p>
                      <p className="mt-1 text-xs text-slate-500">{report.id}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {formatMoney(report.grossSales, report.currency)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {formatMoney(report.netProfitAfterCOGS, report.currency)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{report.warningCount}</td>
                    <td className="px-4 py-4 text-slate-700">{report.downloadCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent downloads
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Latest report downloads
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">File type</th>
                <th className="px-4 py-3">Downloaded</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentDownloads.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-slate-600" colSpan={4}>
                    No downloads yet.
                  </td>
                </tr>
              ) : (
                dashboard.recentDownloads.map((download) => (
                  <tr
                    className="border-b border-stone-100 last:border-0"
                    key={download.id}
                  >
                    <td className="px-4 py-4 font-semibold text-slate-950">
                      {download.userEmail}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-600">
                      {download.reportId}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {download.fileType}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {formatDate(download.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
