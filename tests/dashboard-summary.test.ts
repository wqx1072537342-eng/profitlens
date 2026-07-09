import { describe, expect, it } from "vitest";

import {
  buildDashboardSummary,
  type DashboardReportRow,
  type DashboardUploadBatchRow,
  type DashboardUploadRow,
} from "../src/lib/dashboard/dashboardSummary";

function report(overrides: Partial<DashboardReportRow> = {}): DashboardReportRow {
  return {
    ads: -10,
    completeness_status: "complete",
    created_at: "2026-07-09T00:00:00.000Z",
    currency: "USD",
    fees: -20,
    gross_sales: 200,
    id: "report-1",
    included_file_types_json: [
      "orders",
      "fees",
      "refunds",
      "shippingLabels",
      "salesTax",
      "deposits",
    ],
    missing_file_types_json: ["ads", "offsiteAds", "cogs"],
    net_profit_after_cogs: 120,
    net_profit_before_cogs: 150,
    refunds: -5,
    shipping: -15,
    status: "preview",
    tax_collected: 12,
    upload_batch_id: "batch-1",
    warnings_json: [],
    ...overrides,
  };
}

function uploadBatch(
  overrides: Partial<DashboardUploadBatchRow> = {},
): DashboardUploadBatchRow {
  return {
    created_at: "2026-07-08T00:00:00.000Z",
    file_count: 2,
    id: "batch-1",
    status: "parsed",
    updated_at: "2026-07-08T00:00:00.000Z",
    warning_count: 0,
    ...overrides,
  };
}

function upload(overrides: Partial<DashboardUploadRow> = {}): DashboardUploadRow {
  return {
    created_at: "2026-07-08T00:00:00.000Z",
    file_name: "orders.csv",
    file_size_bytes: 1000,
    file_type: "orders",
    id: "upload-1",
    row_count: 10,
    upload_batch_id: "batch-1",
    warnings_json: [],
    ...overrides,
  };
}

describe("dashboard summary", () => {
  it("returns an upload next action for an empty workspace", () => {
    const summary = buildDashboardSummary({
      downloads: [],
      reports: [],
      uploadBatches: [],
      uploads: [],
    });

    expect(summary.hasAnyData).toBe(false);
    expect(summary.metrics.totalUploadedFiles).toBe(0);
    expect(summary.nextBestAction.href).toBe("/upload");
    expect(summary.nextBestAction.title).toBe("Upload your first Etsy CSV files");
    expect(summary.completeness.source).toBe("none");
  });

  it("uses latest upload files for completeness before a report exists", () => {
    const summary = buildDashboardSummary({
      downloads: [],
      reports: [],
      uploadBatches: [uploadBatch()],
      uploads: [
        upload({ file_type: "orders" }),
        upload({ file_type: "fees", id: "upload-2" }),
      ],
    });

    expect(summary.hasAnyData).toBe(true);
    expect(summary.latestReport).toBeNull();
    expect(summary.latestUploadBatch?.fileTypes).toEqual(["fees", "orders"]);
    expect(summary.completeness.source).toBe("upload");
    expect(summary.completeness.status).toBe("partial");
    expect(summary.nextBestAction.title).toBe("Generate a Profit Preview");
  });

  it("builds latest report KPI values and download counts from real rows", () => {
    const summary = buildDashboardSummary({
      downloads: [
        {
          created_at: "2026-07-09T03:00:00.000Z",
          file_type: "xlsx",
          id: "download-1",
          report_id: "report-1",
        },
      ],
      reports: [report()],
      uploadBatches: [uploadBatch()],
      uploads: [upload()],
    });

    expect(summary.metrics.latestGrossSales).toBe(200);
    expect(summary.metrics.latestNetProfitBeforeCOGS).toBe(150);
    expect(summary.metrics.latestProfitMargin).toBe(75);
    expect(summary.metrics.totalDownloads).toBe(1);
    expect(summary.latestReport?.downloadCount).toBe(1);
    expect(summary.nextBestAction.href).toBe("/feedback");
  });

  it("asks users to add missing required files for a limited report", () => {
    const summary = buildDashboardSummary({
      downloads: [],
      reports: [
        report({
          completeness_status: "limited",
          included_file_types_json: ["orders"],
          missing_file_types_json: ["fees", "refunds", "shippingLabels", "salesTax", "deposits"],
          warnings_json: [{ code: "MISSING_EXPECTED_FILE" }],
        }),
      ],
      uploadBatches: [uploadBatch()],
      uploads: [upload()],
    });

    expect(summary.completeness.status).toBe("limited");
    expect(summary.nextBestAction.title).toBe("Improve data completeness");
    expect(summary.nextBestAction.href).toBe("/upload");
  });
});
