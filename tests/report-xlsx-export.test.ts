import { describe, expect, it } from "vitest";

import {
  buildProfitReportWorksheets,
  buildProfitReportXlsx,
} from "../src/lib/reports/exportProfitReportXlsx";
import type { ProfitReportExportRow } from "../src/lib/reports/exportProfitReportCsv";

function sampleReport(overrides: Partial<ProfitReportExportRow> = {}) {
  return {
    ads: -12.5,
    completeness_status: "partial",
    created_at: "2026-07-08T00:00:00.000Z",
    currency: "USD",
    fees: -7.25,
    gross_sales: 120,
    id: "11111111-2222-3333-4444-555555555555",
    included_file_types_json: ["orders", "fees"],
    missing_file_types_json: ["refunds"],
    net_profit_after_cogs: 80,
    net_profit_before_cogs: 80,
    refunds: -10,
    shipping: -5,
    tax_collected: 8.25,
    warnings_json: [
      {
        code: "MISSING_EXPECTED_FILE",
        field: "File",
        filePath: "=danger.csv",
        message: "+Missing refunds file",
        row: 2,
      },
    ],
    ...overrides,
  } satisfies ProfitReportExportRow;
}

describe("profit report XLSX export", () => {
  it("builds four workbook sheets for the report package", () => {
    const sheets = buildProfitReportWorksheets(sampleReport());

    expect(sheets.map((sheet) => sheet.name)).toEqual([
      "Summary",
      "File Coverage",
      "Warnings",
      "Notes",
    ]);
    expect(sheets[0]?.rows.flat()).toContain("Gross Sales");
    expect(sheets[1]?.rows.flat()).toContain("COGS not detected or not provided");
    expect(sheets[2]?.rows.flat()).toContain("+Missing refunds file");
  });

  it("creates a real XLSX zip package with workbook parts", () => {
    const xlsx = buildProfitReportXlsx(sampleReport());
    const text = xlsx.toString("utf8");

    expect(xlsx.subarray(0, 2).toString("utf8")).toBe("PK");
    expect(text).toContain("[Content_Types].xml");
    expect(text).toContain("xl/workbook.xml");
    expect(text).toContain("xl/worksheets/sheet1.xml");
    expect(text).toContain("Summary");
    expect(text).toContain("File Coverage");
    expect(text).toContain("Warnings");
    expect(text).toContain("Notes");
  });

  it("escapes spreadsheet formula-like text inside workbook XML", () => {
    const xlsx = buildProfitReportXlsx(sampleReport());
    const text = xlsx.toString("utf8");

    expect(text).toContain("&apos;+Missing refunds file");
    expect(text).toContain("&apos;=danger.csv");
    expect(text).not.toContain("<f>");
  });
});
