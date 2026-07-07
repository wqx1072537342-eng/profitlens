import { redirect } from "next/navigation";
import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

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
            <form action={signOutAction}>
              <button
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sprint 3 status
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            CSV upload and Profit Preview are ready to use
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
            <p className="mt-2 text-lg font-black text-teal-800">Profit Preview</p>
          </div>
        </div>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Sprint 3 supports CSV file selection, metadata saving, file type recognition,
          field preview, warnings, and a basic Profit Preview. PDF, Excel, Stripe,
          and real Etsy API connections remain intentionally out of scope.
        </p>
      </section>
    </div>
  );
}
