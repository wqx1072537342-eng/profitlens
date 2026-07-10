"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitFeedbackAction } from "./actions";
import { initialSubmissionFormState } from "./state";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-5 inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Saving..." : "Save feedback"}
    </button>
  );
}

export function FeedbackForm({
  defaultEmail,
  topics,
}: {
  defaultEmail: string;
  topics: string[];
}) {
  const [state, formAction] = useActionState(
    submitFeedbackAction,
    initialSubmissionFormState,
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Email
          <input
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
            defaultValue={defaultEmail}
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Topic
          <select
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950"
            defaultValue={topics[0]}
            name="topic"
            required
          >
            {topics.map((topic) => (
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
            placeholder="Describe what happened, which CSV file was involved, and what result you expected."
            required
          />
        </label>
      </div>

      <SubmitButton />
      {state.message ? (
        <p
          className={`mt-3 rounded-md border px-3 py-2 text-sm font-semibold ${
            state.status === "success"
              ? "border-teal-200 bg-teal-50 text-teal-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Feedback is saved to FlowSync AI so the product team can prioritize V1.0
        fixes and paid validation.
      </p>
    </form>
  );
}
