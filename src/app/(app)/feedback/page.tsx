import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";

export const dynamic = "force-dynamic";

const feedbackTopics = [
  "CSV file was not recognized",
  "Report numbers look wrong",
  "Missing Etsy fee category",
  "Need PDF or CPA export",
  "I would pay for this",
  "Other feedback",
];

export default async function FeedbackPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Feedback
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Tell us what blocks your Etsy report
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Feedback is the fastest path to paid validation. Send CSV recognition
          problems, missing categories, confusing warnings, or paid-intent notes.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          action="mailto:support@profitlens.app"
          className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
          encType="text/plain"
          method="post"
        >
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Email
              <input
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={user.email ?? ""}
                name="email"
                type="email"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Topic
              <select
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
                defaultValue={feedbackTopics[0]}
                name="topic"
              >
                {feedbackTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Message
              <textarea
                className="min-h-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
                name="message"
                placeholder="Describe what happened, which Etsy CSV file was involved, and what result you expected."
              />
            </label>
          </div>

          <button
            className="mt-5 inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            type="submit"
          >
            Open email app
          </button>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            This form opens your email app and does not save feedback to the database.
          </p>
        </form>

        <aside className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            What helps most
          </p>
          <div className="mt-5 grid gap-3">
            {[
              "Which Etsy CSV export you uploaded",
              "Which number looked wrong",
              "Whether a CPA asked for a specific format",
              "Whether you would pay for one report or a monthly plan",
            ].map((item) => (
              <div className="rounded-md border border-stone-200 bg-stone-50 p-3" key={item}>
                <p className="text-sm font-semibold text-slate-800">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
            ProfitLens is bookkeeping preparation, not tax advice. For tax filing
            decisions, send the exported report to your CPA.
          </div>
        </aside>
      </section>
    </div>
  );
}
