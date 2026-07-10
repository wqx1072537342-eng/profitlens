"use server";

import { getCurrentUser } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  validateFeedbackSubmission,
  validateWaitlistSubmission,
} from "@/lib/submissions/validation";

import type { SubmissionFormState } from "./state";

function configurationError(): SubmissionFormState {
  return {
    message: "Supabase is not configured. Try again after setup is complete.",
    status: "error",
  };
}

export async function submitWaitlistAction(
  _previousState: SubmissionFormState,
  formData: FormData,
): Promise<SubmissionFormState> {
  const validation = validateWaitlistSubmission({
    email: formData.get("email"),
    interest: formData.get("interest"),
    sourcePage: formData.get("sourcePage"),
  });

  if (validation.status === "error") {
    return validation;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return configurationError();
  }

  const { error } = await supabase.from("waitlist_submissions").insert({
    email: validation.value.email,
    interest: validation.value.interest,
    source_page: validation.value.sourcePage,
  });

  if (error) {
    return {
      message: error.message,
      status: "error",
    };
  }

  return {
    message: "You are on the waitlist.",
    status: "success",
  };
}

export async function submitFeedbackAction(
  _previousState: SubmissionFormState,
  formData: FormData,
): Promise<SubmissionFormState> {
  const validation = validateFeedbackSubmission({
    email: formData.get("email"),
    message: formData.get("message"),
    topic: formData.get("topic"),
  });

  if (validation.status === "error") {
    return validation;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return configurationError();
  }

  const { user } = await getCurrentUser();
  const email = user?.email ?? validation.value.email;

  const { error } = await supabase.from("feedback_submissions").insert({
    email,
    message: validation.value.message,
    topic: validation.value.topic,
    user_id: user?.id ?? null,
  });

  if (error) {
    return {
      message: error.message,
      status: "error",
    };
  }

  return {
    message: "Thanks. Your feedback was saved.",
    status: "success",
  };
}
