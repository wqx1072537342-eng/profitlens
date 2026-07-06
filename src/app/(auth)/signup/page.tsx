import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/session";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const { isConfigured, user } = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Signup
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Create account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create a ProfitLens account so report ownership can be tied to your user.
        </p>
      </div>

      {!isConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Supabase is not configured yet. Add the required values in `.env.local`
          before using authentication.
        </p>
      ) : null}

      <AuthForm action={signUpAction} mode="signup" />

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-teal-800 hover:text-teal-900" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}

