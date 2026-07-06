import { redirect } from "next/navigation";

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
              Protected dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Welcome to ProfitLens
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Signed in as <span className="font-semibold">{user.email}</span>.
            </p>
          </div>
          <form action={signOutAction}>
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sprint 1 status
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Account foundation is ready
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-stone-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Authentication</p>
            <p className="mt-2 text-lg font-black text-teal-800">Enabled</p>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Reports</p>
            <p className="mt-2 text-lg font-black text-slate-950">No reports yet</p>
          </div>
          <div className="rounded-md border border-stone-200 p-4">
            <p className="text-sm font-semibold text-slate-500">Next sprint</p>
            <p className="mt-2 text-lg font-black text-slate-950">CSV upload</p>
          </div>
        </div>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          CSV upload, parser, calculation, export, and download flows are outside
          Sprint 1 and are intentionally not implemented here.
        </p>
      </section>
    </div>
  );
}

