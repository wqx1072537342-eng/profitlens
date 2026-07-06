import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Login
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Log in to access your protected ProfitLens dashboard.
        </p>
      </div>

      {!isConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Supabase is not configured yet. Add the required values in `.env.local`
          before using authentication.
        </p>
      ) : null}

      <AuthForm action={signInAction} mode="login" />

      <p className="text-sm text-slate-600">
        New to ProfitLens?{" "}
        <Link className="font-semibold text-teal-800 hover:text-teal-900" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  );
}

