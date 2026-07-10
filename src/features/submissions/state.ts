export interface SubmissionFormState {
  message: string;
  status: "idle" | "success" | "error";
}

export const initialSubmissionFormState: SubmissionFormState = {
  message: "",
  status: "idle",
};
