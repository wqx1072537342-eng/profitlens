"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { AuthFormState } from "@/features/auth/state";
import { initialAuthFormState } from "@/features/auth/state";

interface AuthFormProps {
  action: (
    previousState: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  mode: "login" | "signup";
}

function SubmitButton({ mode }: { mode: AuthFormProps["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-md bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Working..." : mode === "login" ? "Log in" : "Create account"}
    </button>
  );
}

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialAuthFormState);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-slate-800">
        Email
        <input
          autoComplete="email"
          className="rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          name="email"
          required
          type="email"
        />
        {state.fieldErrors?.email ? (
          <span className="text-sm text-rose-700">{state.fieldErrors.email}</span>
        ) : null}
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-800">
        Password
        <input
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          minLength={8}
          name="password"
          required
          type="password"
        />
        {state.fieldErrors?.password ? (
          <span className="text-sm text-rose-700">{state.fieldErrors.password}</span>
        ) : null}
      </label>

      {state.message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            state.status === "success"
              ? "border-teal-200 bg-teal-50 text-teal-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton mode={mode} />
    </form>
  );
}
