import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";
import { loadReportHistory } from "@/features/reports/history";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function AccountPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  const recentReports = await loadReportHistory(3);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Your ProfitLens workspace
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Manage your Free Beta account and continue the Etsy CSV reporting workflow.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Profile
          </p>
          <div className="mt-5 grid gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Email</p>
              <p className="mt-1 break-all font-bold text-slate-950">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Business type</p>
              <p className="mt-1 font-bold text-slate-950">Etsy seller</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Plan</p>
              <p className="mt-1 font-bold text-teal-800">Free Beta</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              href="/upload"
            >
              Upload CSV
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              href="/settings"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Recent reports
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Latest Etsy Profit Previews
              </h2>
            </div>
            <Link
              className="text-sm font-bold text-teal-800 transition hover:text-teal-900"
              href="/reports"
            >
              View all
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="mt-5 rounded-md border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-semibold text-slate-950">
                No reports yet.
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Upload Etsy CSV files to generate your first Profit Preview.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {recentReports.map((report) => (
                <Link
                  className="rounded-md border border-stone-200 p-4 transition hover:bg-stone-50"
                  href={`/reports/${report.id}`}
                  key={report.id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-950">
                        {formatDate(report.createdAt)}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                        {report.warningCount} warnings
                      </p>
                    </div>
                    <p className="text-sm font-bold text-teal-800">
                      {report.downloadCount} downloads
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
