"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitWaitlistAction } from "./actions";
import { initialSubmissionFormState } from "./state";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Joining..." : "Join waitlist"}
    </button>
  );
}

export function WaitlistForm({
  interest,
  sourcePage,
}: {
  interest: string;
  sourcePage: string;
}) {
  const [state, formAction] = useActionState(
    submitWaitlistAction,
    initialSubmissionFormState,
  );

  return (
    <form
      action={formAction}
      className="mt-5 grid gap-3 rounded-md border border-amber-200 bg-amber-50 p-4"
    >
      <input name="interest" type="hidden" value={interest} />
      <input name="sourcePage" type="hidden" value={sourcePage} />
      <p className="text-sm font-bold text-amber-950">
        This integration is Coming Soon. Join the waitlist and we will use this
        signal to prioritize what ships next.
      </p>
      <input
        className="rounded-md border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />
      <SubmitButton />
      {state.message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm font-semibold ${
            state.status === "success"
              ? "border-teal-200 bg-teal-50 text-teal-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
