export interface AuthFormState {
  message: string;
  status: "idle" | "error" | "success";
  fieldErrors?: {
    email?: string;
    password?: string;
  };
}

export const initialAuthFormState: AuthFormState = {
  message: "",
  status: "idle",
};

