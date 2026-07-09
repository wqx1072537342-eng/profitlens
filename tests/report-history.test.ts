import { describe, expect, it } from "vitest";

import {
  buildReportHistoryItems,
  countDownloadsByReportId,
  warningCountFromJson,
} from "../src/lib/reports/reportHistory";

describe("report history helpers", () => {
  it("counts warnings only when warnings_json is an array", () => {
    expect(warningCountFromJson([{ code: "A" }, { code: "B" }])).toBe(2);
    expect(warningCountFromJson({ code: "A" })).toBe(0);
    expect(warningCountFromJson(null)).toBe(0);
  });

  it("counts download events by report id", () => {
    const counts = countDownloadsByReportId([
      { report_id: "report-1" },
      { report_id: "report-1" },
      { report_id: "report-2" },
    ]);

    expect(counts.get("report-1")).toBe(2);
    expect(counts.get("report-2")).toBe(1);
    expect(counts.get("report-3")).toBeUndefined();
  });

  it("builds report history items with warning and download counts", () => {
    const items = buildReportHistoryItems(
      [
        {
          completeness_status: "partial",
          created_at: "2026-07-08T00:00:00.000Z",
          currency: "USD",
          gross_sales: 100,
          id: "report-1",
          net_profit_after_cogs: 70,
          net_profit_before_cogs: 80,
          warnings_json: [{ code: "MISSING_EXPECTED_FILE" }],
        },
        {
          completeness_status: "complete",
          created_at: "2026-07-09T00:00:00.000Z",
          currency: "USD",
          gross_sales: 200,
          id: "report-2",
          net_profit_after_cogs: 120,
          net_profit_before_cogs: 140,
          warnings_json: [],
        },
      ],
      [{ report_id: "report-1" }, { report_id: "report-1" }],
    );

    expect(items).toEqual([
      {
        completenessStatus: "partial",
        createdAt: "2026-07-08T00:00:00.000Z",
        currency: "USD",
        downloadCount: 2,
        grossSales: 100,
        id: "report-1",
        netProfitAfterCOGS: 70,
        netProfitBeforeCOGS: 80,
        warningCount: 1,
      },
      {
        completenessStatus: "complete",
        createdAt: "2026-07-09T00:00:00.000Z",
        currency: "USD",
        downloadCount: 0,
        grossSales: 200,
        id: "report-2",
        netProfitAfterCOGS: 120,
        netProfitBeforeCOGS: 140,
        warningCount: 0,
      },
    ]);
  });
});
