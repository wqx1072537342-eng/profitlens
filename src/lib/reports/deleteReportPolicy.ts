export const DELETE_REPORT_CONFIRMATION_MESSAGE =
  "Delete this report? This removes the report and its download history for your account.";

export function canDeleteReport({
  currentUserId,
  reportUserId,
}: {
  currentUserId: string | null | undefined;
  reportUserId: string | null | undefined;
}) {
  return Boolean(currentUserId && reportUserId && currentUserId === reportUserId);
}

export function deleteReportRedirectPath() {
  return "/reports";
}
