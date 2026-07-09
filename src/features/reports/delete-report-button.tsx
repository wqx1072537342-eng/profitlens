"use client";

import { useFormStatus } from "react-dom";

import { DELETE_REPORT_CONFIRMATION_MESSAGE } from "@/lib/reports/deleteReportPolicy";

import { deleteReportAction } from "./actions";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

export function DeleteReportButton({ reportId }: { reportId: string }) {
  return (
    <form
      action={deleteReportAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(DELETE_REPORT_CONFIRMATION_MESSAGE);

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input name="reportId" type="hidden" value={reportId} />
      <DeleteSubmitButton />
    </form>
  );
}
