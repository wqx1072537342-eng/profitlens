import type { Json } from "@/lib/supabase/types";

export interface ReportHistoryRow {
  id: string;
  created_at: string;
  currency: string;
  completeness_status: string;
  gross_sales: number;
  net_profit_before_cogs: number;
  net_profit_after_cogs: number;
  warnings_json: Json;
}

export interface DownloadEventReportRow {
  report_id: string;
}

export interface ReportHistoryItem {
  id: string;
  createdAt: string;
  currency: string;
  completenessStatus: string;
  grossSales: number;
  netProfitBeforeCOGS: number;
  netProfitAfterCOGS: number;
  warningCount: number;
  downloadCount: number;
}

export function warningCountFromJson(value: Json): number {
  return Array.isArray(value) ? value.length : 0;
}

export function countDownloadsByReportId(
  downloads: readonly DownloadEventReportRow[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const download of downloads) {
    counts.set(download.report_id, (counts.get(download.report_id) ?? 0) + 1);
  }

  return counts;
}

export function buildReportHistoryItems(
  reports: readonly ReportHistoryRow[],
  downloads: readonly DownloadEventReportRow[],
): ReportHistoryItem[] {
  const downloadCounts = countDownloadsByReportId(downloads);

  return reports.map((report) => ({
    completenessStatus: report.completeness_status,
    createdAt: report.created_at,
    currency: report.currency,
    downloadCount: downloadCounts.get(report.id) ?? 0,
    grossSales: report.gross_sales,
    id: report.id,
    netProfitAfterCOGS: report.net_profit_after_cogs,
    netProfitBeforeCOGS: report.net_profit_before_cogs,
    warningCount: warningCountFromJson(report.warnings_json),
  }));
}
