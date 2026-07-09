import { describe, expect, it } from "vitest";

import {
  buildProfitReportCsv,
  csvCell,
  escapeSpreadsheetFormula,
  REPORT_DISCLAIMER,
  type ProfitReportExportRow,
} from "../src/lib/reports/exportProfitReportCsv";

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

describe("profit report CSV export", () => {
  it("escapes spreadsheet formulas in text cells", () => {
    expect(escapeSpreadsheetFormula("=HYPERLINK(\"https://example.com\")")).toBe(
      "'=HYPERLINK(\"https://example.com\")",
    );
    expect(escapeSpreadsheetFormula("+SUM(1,1)")).toBe("'+SUM(1,1)");
    expect(escapeSpreadsheetFormula("-cmd")).toBe("'-cmd");
    expect(escapeSpreadsheetFormula("@user")).toBe("'@user");
    expect(csvCell("-plain text")).toBe('"\'-plain text"');
    expect(csvCell(-12.34)).toBe('"-12.34"');
  });

  it("builds an Excel-compatible CSV with summary, coverage, warnings, and disclaimer", () => {
    const csv = buildProfitReportCsv(sampleReport());

    expect(csv).toContain('"ProfitLens Etsy Profit Report"');
    expect(csv).toContain('"Annual Summary"');
    expect(csv).toContain('"Gross Sales","120.00"');
    expect(csv).toContain('"Included CSV Types","orders, fees"');
    expect(csv).toContain('"Missing CSV Types","refunds"');
    expect(csv).toContain('"Status","COGS not detected or not provided"');
    expect(csv).toContain('"MISSING_EXPECTED_FILE","\'+Missing refunds file"');
    expect(csv).toContain('"\'=danger.csv"');
    expect(csv).toContain(REPORT_DISCLAIMER);
    expect(csv.endsWith("\r\n")).toBe(true);
  });

  it("marks COGS included when after-COGS profit differs", () => {
    const csv = buildProfitReportCsv(
      sampleReport({
        net_profit_after_cogs: 55,
      }),
    );

    expect(csv).toContain('"Status","COGS included"');
    expect(csv).toContain('"Net Profit After COGS","55.00","COGS included"');
  });
});
