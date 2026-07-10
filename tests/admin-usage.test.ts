import { describe, expect, it } from "vitest";

import {
  buildAdminUsageDashboard,
  isAdminEmail,
} from "../src/lib/admin/usageAnalytics";

describe("admin usage analytics", () => {
  it("checks admin email against comma-separated config", () => {
    expect(isAdminEmail("Founder@Example.com", "admin@example.com, founder@example.com"))
      .toBe(true);
    expect(isAdminEmail("seller@example.com", "admin@example.com")).toBe(false);
    expect(isAdminEmail(null, "admin@example.com")).toBe(false);
    expect(isAdminEmail("admin@example.com", "")).toBe(false);
    expect(isAdminEmail(" admin@example.com ", " admin@example.com ")).toBe(true);
  });

  it("builds customer usage and conversion metrics", () => {
    const dashboard = buildAdminUsageDashboard({
      downloads: [
        {
          created_at: "2026-07-08T04:00:00.000Z",
          file_type: "xlsx",
          id: "download-1",
          report_id: "report-1",
          user_id: "user-1",
        },
        {
          created_at: "2026-07-08T05:00:00.000Z",
          file_type: "xlsx",
          id: "download-2",
          report_id: "report-1",
          user_id: "user-1",
        },
      ],
      feedbackSubmissions: [
        {
          created_at: "2026-07-08T07:00:00.000Z",
          email: "anon@example.com",
          id: "feedback-1",
          message: "Please support Shopify exports next.",
          topic: "I would pay for this",
          user_id: null,
        },
        {
          created_at: "2026-07-08T08:00:00.000Z",
          email: "seller1@example.com",
          id: "feedback-2",
          message: "The report warning was useful.",
          topic: "Report numbers look wrong",
          user_id: "user-1",
        },
      ],
      reports: [
        {
          created_at: "2026-07-08T03:00:00.000Z",
          currency: "USD",
          gross_sales: 100,
          id: "report-1",
          net_profit_after_cogs: 55,
          net_profit_before_cogs: 70,
          user_id: "user-1",
          warnings_json: [{ code: "MISSING_EXPECTED_FILE" }],
        },
        {
          created_at: "2026-07-08T02:00:00.000Z",
          currency: "USD",
          gross_sales: 80,
          id: "report-2",
          net_profit_after_cogs: 40,
          net_profit_before_cogs: 40,
          user_id: "user-2",
          warnings_json: [],
        },
      ],
      uploadBatches: [
        { created_at: "2026-07-08T01:00:00.000Z", id: "batch-1", user_id: "user-1" },
      ],
      uploads: [{ id: "upload-1", user_id: "user-1" }],
      users: [
        {
          created_at: "2026-07-08T00:00:00.000Z",
          email: "seller1@example.com",
          id: "user-1",
        },
        {
          created_at: "2026-07-08T00:10:00.000Z",
          email: "seller2@example.com",
          id: "user-2",
        },
        {
          created_at: "2026-07-08T00:20:00.000Z",
          email: "lead@example.com",
          id: "user-3",
        },
      ],
      waitlistSubmissions: [
        {
          created_at: "2026-07-08T06:00:00.000Z",
          email: "lead@example.com",
          id: "waitlist-1",
          interest: "Shopify to QuickBooks",
          source_page: "/shopify-to-quickbooks",
        },
      ],
    });

    expect(dashboard.metrics).toMatchObject({
      highIntentUsers: 1,
      reportToDownloadRate: 50,
      reportsWithWarnings: 1,
      reportWarningRate: 50,
      signupToUploadRate: 33.3,
      totalDownloads: 2,
      totalFeedbackSubmissions: 2,
      totalReports: 2,
      totalUploadBatches: 1,
      totalUploadedFiles: 1,
      totalUsers: 3,
      totalWaitlistSubmissions: 1,
      uploadToReportRate: 100,
      usersWithAtLeastOneUpload: 1,
      usersWithAtLeastOneDownload: 1,
      usersWithAtLeastOneReport: 2,
    });
    expect(dashboard.conversionFunnel.map((step) => step.label)).toEqual([
      "Signed up",
      "Uploaded CSV",
      "Generated report",
      "Downloaded Excel",
    ]);
    expect(dashboard.highIntentUsers[0]).toMatchObject({
      downloadCount: 2,
      email: "seller1@example.com",
      reportCount: 1,
      uploadBatchCount: 1,
      uploadFileCount: 1,
      warningCount: 1,
    });
    expect(dashboard.recentReports[0]).toMatchObject({
      downloadCount: 2,
      id: "report-1",
      userEmail: "seller1@example.com",
      warningCount: 1,
    });
    expect(dashboard.recentDownloads[0]).toMatchObject({
      id: "download-2",
      userEmail: "seller1@example.com",
    });
    expect(dashboard.recentWaitlistSubmissions[0]).toMatchObject({
      email: "lead@example.com",
      interest: "Shopify to QuickBooks",
      sourcePage: "/shopify-to-quickbooks",
    });
    expect(dashboard.recentFeedbackSubmissions[0]).toMatchObject({
      id: "feedback-2",
      topic: "Report numbers look wrong",
      userEmail: "seller1@example.com",
    });
  });
});
