import { describe, expect, it } from "vitest";

import {
  canDeleteReport,
  DELETE_REPORT_CONFIRMATION_MESSAGE,
  deleteReportRedirectPath,
} from "../src/lib/reports/deleteReportPolicy";

describe("delete report policy", () => {
  it("allows users to delete only their own reports", () => {
    expect(
      canDeleteReport({
        currentUserId: "user-1",
        reportUserId: "user-1",
      }),
    ).toBe(true);
    expect(
      canDeleteReport({
        currentUserId: "user-1",
        reportUserId: "user-2",
      }),
    ).toBe(false);
    expect(
      canDeleteReport({
        currentUserId: null,
        reportUserId: "user-1",
      }),
    ).toBe(false);
  });

  it("uses a clear confirmation message and report redirect path", () => {
    expect(DELETE_REPORT_CONFIRMATION_MESSAGE).toContain("Delete this report");
    expect(DELETE_REPORT_CONFIRMATION_MESSAGE).toContain("download history");
    expect(deleteReportRedirectPath()).toBe("/reports");
  });
});
