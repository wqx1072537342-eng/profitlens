export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthValidationResult {
  credentials?: AuthCredentials;
  fieldErrors: {
    email?: string;
    password?: string;
  };
}

export function validateAuthCredentials(formData: FormData): AuthValidationResult {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fieldErrors: AuthValidationResult["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (fieldErrors.email || fieldErrors.password) {
    return { fieldErrors };
  }

  return {
    credentials: { email, password },
    fieldErrors,
  };
}

