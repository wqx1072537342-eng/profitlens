import type { Json } from "@/lib/supabase/types";

export const REPORT_DISCLAIMER =
  "This report is generated based on CSV files uploaded by the user. It is provided for bookkeeping and tax preparation reference only and does not constitute tax, legal, or accounting advice. Please consult a qualified tax professional before filing.";

export interface ProfitReportExportRow {
  id: string;
  currency: string;
  gross_sales: number;
  refunds: number;
  fees: number;
  ads: number;
  shipping: number;
  tax_collected: number;
  net_profit_before_cogs: number;
  net_profit_after_cogs: number;
  completeness_status: string;
  included_file_types_json: Json;
  missing_file_types_json: Json;
  warnings_json: Json;
  created_at: string;
}

interface WarningExportRow {
  code: string;
  message: string;
  filePath: string;
  field: string;
  row: string;
}

function jsonToStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function jsonToWarnings(value: Json): WarningExportRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, Json | undefined> => {
      return Boolean(item) && typeof item === "object" && !Array.isArray(item);
    })
    .map((item) => ({
      code: typeof item.code === "string" ? item.code : "WARNING",
      field: typeof item.field === "string" ? item.field : "",
      filePath: typeof item.filePath === "string" ? item.filePath : "",
      message: typeof item.message === "string" ? item.message : "Review this CSV row.",
      row: typeof item.row === "number" ? String(item.row) : "",
    }));
}

export function escapeSpreadsheetFormula(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

export function csvCell(value: string | number | null | undefined): string {
  const stringValue =
    typeof value === "number" ? value.toFixed(2) : escapeSpreadsheetFormula(value ?? "");
  return `"${stringValue.replaceAll('"', '""')}"`;
}

function csvRow(values: readonly (string | number | null | undefined)[]): string {
  return values.map(csvCell).join(",");
}

export function buildProfitReportCsv(report: ProfitReportExportRow): string {
  const includedFileTypes = jsonToStringArray(report.included_file_types_json);
  const missingFileTypes = jsonToStringArray(report.missing_file_types_json);
  const warnings = jsonToWarnings(report.warnings_json);
  const cogsStatus =
    report.net_profit_before_cogs === report.net_profit_after_cogs
      ? "COGS not detected or not provided"
      : "COGS included";
  const generatedAt = new Date().toISOString();

  const rows = [
    csvRow(["FlowSync AI Etsy Profit Report"]),
    csvRow(["Generated At", generatedAt]),
    csvRow(["Report ID", report.id]),
    csvRow(["Report Created At", report.created_at]),
    csvRow(["Currency", report.currency]),
    csvRow([]),
    csvRow(["Annual Summary"]),
    csvRow(["Metric", "Amount", "Notes"]),
    csvRow(["Gross Sales", report.gross_sales, "Orders, shipping income, and seller-funded discounts"]),
    csvRow(["Refunds", report.refunds, "Refunds, chargebacks, reversals, and Etsy case refunds"]),
    csvRow(["Etsy Fees", report.fees, "Platform fees, credits, and chargeback fees"]),
    csvRow(["Ads", report.ads, "Etsy Ads and Offsite Ads"]),
    csvRow(["Shipping Labels", report.shipping, "Shipping label costs and refunds"]),
    csvRow([
      "Sales Tax / VAT / GST",
      report.tax_collected,
      "Marketplace-collected tax shown separately and excluded from profit",
    ]),
    csvRow(["Net Profit Before COGS", report.net_profit_before_cogs, "Profit before product costs"]),
    csvRow(["Net Profit After COGS", report.net_profit_after_cogs, cogsStatus]),
    csvRow([]),
    csvRow(["File Coverage"]),
    csvRow(["Completeness", report.completeness_status]),
    csvRow(["Included CSV Types", includedFileTypes.join(", ") || "None"]),
    csvRow(["Missing CSV Types", missingFileTypes.join(", ") || "None"]),
    csvRow([]),
    csvRow(["COGS Status"]),
    csvRow(["Status", cogsStatus]),
    csvRow([]),
    csvRow(["Warnings"]),
    csvRow(["Code", "Message", "File", "Field", "Row"]),
    ...(warnings.length > 0
      ? warnings.map((warning) =>
          csvRow([
            warning.code,
            warning.message,
            warning.filePath,
            warning.field,
            warning.row,
          ]),
        )
      : [csvRow(["No warnings", "", "", "", ""])]),
    csvRow([]),
    csvRow(["Disclaimer"]),
    csvRow([REPORT_DISCLAIMER]),
  ];

  return `${rows.join("\r\n")}\r\n`;
}
