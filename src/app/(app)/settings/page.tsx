import { redirect } from "next/navigation";

import { signOutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/session";

export const dynamic = "force-dynamic";

const settingSections = [
  {
    body: "Display name, business type, and default reporting currency will be editable after the core Etsy workflow is stable.",
    items: ["Email is managed by Supabase Auth", "Business type defaults to Etsy seller"],
    title: "Profile",
  },
  {
    body: "Email notifications will help sellers know when reports finish and when warnings need review.",
    items: ["Report ready emails: Coming Soon", "Warning summary emails: Coming Soon"],
    title: "Notifications",
  },
  {
    body: "Security settings use Supabase Auth today. Additional controls can be added after MVP validation.",
    items: ["Password reset through auth flow", "Two-factor authentication: Later"],
    title: "Security",
  },
  {
    body: "Account deletion and data retention controls should be implemented before paid launch.",
    items: ["Delete account: Coming Soon", "Export account data: Later"],
    title: "Account",
  },
];

export default async function SettingsPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Workspace settings
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Settings are intentionally lightweight during the Etsy-first MVP. Editable
          preferences will be added only when they support upload, preview, download,
          or customer support.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {settingSections.map((section) => (
          <article
            className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
            key={section.title}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-600">
                MVP shell
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
            <ul className="mt-5 grid gap-2 text-sm text-slate-700">
              {section.items.map((item) => (
                <li className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">Signed in email</p>
        <p className="mt-1 break-all font-bold text-slate-950">{user.email}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          To change auth details, use the current login and password reset flow. No
          custom profile database writes are added in Sprint 6.
        </p>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Session
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Sign out safely
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Use this when you are finished reviewing uploads, reports, or admin
              data on this device.
            </p>
          </div>
          <form action={signOutAction}>
            <button
              className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
