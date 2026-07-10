const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_INTEREST_LENGTH = 120;
const MAX_SOURCE_PAGE_LENGTH = 200;
const MAX_TOPIC_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 5000;

export interface WaitlistInput {
  email: string;
  interest: string;
  sourcePage: string;
}

export interface FeedbackInput {
  email?: string | null;
  message: string;
  topic: string;
}

export type ValidationResult<T> =
  | {
      status: "success";
      value: T;
    }
  | {
      status: "error";
      message: string;
    };

function clean(value: FormDataEntryValue | string | null | undefined) {
  return String(value ?? "").trim();
}

function validEmail(email: string) {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

export function validateWaitlistSubmission(input: {
  email: FormDataEntryValue | string | null | undefined;
  interest: FormDataEntryValue | string | null | undefined;
  sourcePage: FormDataEntryValue | string | null | undefined;
}): ValidationResult<WaitlistInput> {
  const email = clean(input.email).toLowerCase();
  const interest = clean(input.interest);
  const sourcePage = clean(input.sourcePage);

  if (!validEmail(email)) {
    return {
      message: "Enter a valid email address.",
      status: "error",
    };
  }

  if (!interest || interest.length > MAX_INTEREST_LENGTH) {
    return {
      message: "Choose a valid waitlist interest.",
      status: "error",
    };
  }

  if (!sourcePage || sourcePage.length > MAX_SOURCE_PAGE_LENGTH) {
    return {
      message: "Source page is missing.",
      status: "error",
    };
  }

  return {
    status: "success",
    value: { email, interest, sourcePage },
  };
}

export function validateFeedbackSubmission(input: {
  email?: FormDataEntryValue | string | null | undefined;
  message: FormDataEntryValue | string | null | undefined;
  topic: FormDataEntryValue | string | null | undefined;
}): ValidationResult<FeedbackInput> {
  const email = clean(input.email).toLowerCase();
  const topic = clean(input.topic);
  const message = clean(input.message);

  if (email && !validEmail(email)) {
    return {
      message: "Enter a valid email address, or leave email blank.",
      status: "error",
    };
  }

  if (!topic || topic.length > MAX_TOPIC_LENGTH) {
    return {
      message: "Choose a feedback topic.",
      status: "error",
    };
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return {
      message: "Enter feedback between 1 and 5000 characters.",
      status: "error",
    };
  }

  return {
    status: "success",
    value: { email: email || null, message, topic },
  };
}
