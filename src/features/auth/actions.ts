"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { validateAuthCredentials } from "./schemas";
import type { AuthFormState } from "./state";

function configurationError(): AuthFormState {
  return {
    message:
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    status: "error",
  };
}

export async function signInAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validation = validateAuthCredentials(formData);

  if (!validation.credentials) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Please fix the highlighted fields.",
      status: "error",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return configurationError();
  }

  const { error } = await supabase.auth.signInWithPassword(validation.credentials);

  if (error) {
    return {
      message: error.message,
      status: "error",
    };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validation = validateAuthCredentials(formData);

  if (!validation.credentials) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Please fix the highlighted fields.",
      status: "error",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return configurationError();
  }

  const { data, error } = await supabase.auth.signUp(validation.credentials);

  if (error) {
    return {
      message: error.message,
      status: "error",
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    message: "Account created. Check your email if confirmation is enabled.",
    status: "success",
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}
