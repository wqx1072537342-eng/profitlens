import { getCurrentUser } from "@/features/auth/session";
import { FeedbackForm } from "@/features/submissions/feedback-form";

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

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
        Supabase is not configured yet. Feedback saving is unavailable.
      </div>
    );
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
        <FeedbackForm
          defaultEmail={user?.email ?? ""}
          topics={feedbackTopics}
        />

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
            FlowSync AI is bookkeeping preparation, not tax advice. For tax filing
            decisions, send the exported report to your CPA.
          </div>
        </aside>
      </section>
    </div>
  );
}
