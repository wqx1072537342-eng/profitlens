import {
  analyzeBatchCompleteness,
  completenessLabel,
  EXPECTED_ETSY_FILE_TYPES,
} from "../reports/batchCompleteness";
import type { Json } from "../supabase/types";

export interface DashboardReportRow {
  id: string;
  upload_batch_id: string;
  status: string;
  currency: string;
  gross_sales: number;
  refunds: number;
  fees: number;
  ads: number;
  shipping: number;
  tax_collected: number;
  net_profit_before_cogs: number;
  net_profit_after_cogs: number;
  warnings_json: Json;
  completeness_status: string;
  included_file_types_json: Json;
  missing_file_types_json: Json;
  created_at: string;
}

export interface DashboardUploadBatchRow {
  id: string;
  status: string;
  file_count: number;
  warning_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardUploadRow {
  id: string;
  upload_batch_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  row_count: number;
  warnings_json: Json;
  created_at: string;
}

export interface DashboardDownloadRow {
  id: string;
  report_id: string;
  file_type: string;
  created_at: string;
}

export interface DashboardReportItem {
  id: string;
  uploadBatchId: string;
  createdAt: string;
  currency: string;
  grossSales: number;
  refunds: number;
  fees: number;
  ads: number;
  shipping: number;
  taxCollected: number;
  netProfitBeforeCOGS: number;
  netProfitAfterCOGS: number;
  profitMargin: number | null;
  completenessStatus: string;
  completenessLabel: string;
  includedFileTypes: string[];
  missingFileTypes: string[];
  warningCount: number;
  downloadCount: number;
}

export interface DashboardUploadBatchItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  fileCount: number;
  warningCount: number;
  fileTypes: string[];
  files: DashboardUploadFileItem[];
}

export interface DashboardUploadFileItem {
  id: string;
  fileName: string;
  fileType: string;
  rowCount: number;
  warningCount: number;
  createdAt: string;
}

export interface DashboardCompletenessItem {
  fileType: string;
  label: string;
  impact: string;
  required: boolean;
  status: "included" | "missing";
}

export interface DashboardCompleteness {
  source: "report" | "upload" | "none";
  status: string;
  label: string;
  reportId: string | null;
  uploadBatchId: string | null;
  includedFileTypes: string[];
  missingFileTypes: string[];
  warningCount: number;
  items: DashboardCompletenessItem[];
}

export interface DashboardNextBestAction {
  title: string;
  body: string;
  href: string;
  cta: string;
  tone: "primary" | "warning" | "neutral";
}

export interface DashboardMetrics {
  totalUploadBatches: number;
  totalUploadedFiles: number;
  totalReports: number;
  totalDownloads: number;
  latestGrossSales: number | null;
  latestNetProfitBeforeCOGS: number | null;
  latestNetProfitAfterCOGS: number | null;
  latestProfitMargin: number | null;
  latestCurrency: string | null;
}

export interface DashboardSummary {
  hasAnyData: boolean;
  metrics: DashboardMetrics;
  latestReport: DashboardReportItem | null;
  recentReports: DashboardReportItem[];
  latestUploadBatch: DashboardUploadBatchItem | null;
  completeness: DashboardCompleteness;
  nextBestAction: DashboardNextBestAction;
}

function warningCountFromJson(value: Json): number {
  return Array.isArray(value) ? value.length : 0;
}

function jsonToStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function profitMargin(netProfitBeforeCOGS: number, grossSales: number) {
  if (!Number.isFinite(grossSales) || grossSales <= 0) return null;
  return roundPercent((netProfitBeforeCOGS / grossSales) * 100);
}

function sortByCreatedAtDesc<T extends { created_at: string }>(rows: readonly T[]): T[] {
  return [...rows].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

function countDownloadsByReport(downloads: readonly DashboardDownloadRow[]) {
  const counts = new Map<string, number>();

  for (const download of downloads) {
    counts.set(download.report_id, (counts.get(download.report_id) ?? 0) + 1);
  }

  return counts;
}

function groupUploadsByBatchId(uploads: readonly DashboardUploadRow[]) {
  const groups = new Map<string, DashboardUploadRow[]>();

  for (const upload of uploads) {
    const existing = groups.get(upload.upload_batch_id) ?? [];
    existing.push(upload);
    groups.set(upload.upload_batch_id, existing);
  }

  return groups;
}

function buildReportItem(
  report: DashboardReportRow,
  downloadCount: number,
): DashboardReportItem {
  return {
    ads: report.ads,
    completenessLabel: completenessLabel(report.completeness_status),
    completenessStatus: report.completeness_status,
    createdAt: report.created_at,
    currency: report.currency,
    downloadCount,
    fees: report.fees,
    grossSales: report.gross_sales,
    id: report.id,
    includedFileTypes: jsonToStringArray(report.included_file_types_json),
    missingFileTypes: jsonToStringArray(report.missing_file_types_json),
    netProfitAfterCOGS: report.net_profit_after_cogs,
    netProfitBeforeCOGS: report.net_profit_before_cogs,
    profitMargin: profitMargin(report.net_profit_before_cogs, report.gross_sales),
    refunds: report.refunds,
    shipping: report.shipping,
    taxCollected: report.tax_collected,
    uploadBatchId: report.upload_batch_id,
    warningCount: warningCountFromJson(report.warnings_json),
  };
}

function buildUploadBatchItem(
  batch: DashboardUploadBatchRow,
  uploads: readonly DashboardUploadRow[],
): DashboardUploadBatchItem {
  const files = sortByCreatedAtDesc(uploads).map((upload) => ({
    createdAt: upload.created_at,
    fileName: upload.file_name,
    fileType: upload.file_type,
    id: upload.id,
    rowCount: upload.row_count,
    warningCount: warningCountFromJson(upload.warnings_json),
  }));

  return {
    createdAt: batch.created_at,
    fileCount: batch.file_count,
    fileTypes: Array.from(new Set(files.map((file) => file.fileType).filter(Boolean))).sort(),
    files,
    id: batch.id,
    status: batch.status,
    updatedAt: batch.updated_at,
    warningCount: batch.warning_count,
  };
}

function expectedFileTypeByName(fileType: string) {
  return EXPECTED_ETSY_FILE_TYPES.find((expected) => expected.fileType === fileType);
}

export function dashboardFileTypeLabel(fileType: string) {
  return expectedFileTypeByName(fileType)?.label ?? fileType;
}

function buildCompletenessItems(includedFileTypes: readonly string[]) {
  const included = new Set(includedFileTypes);

  return EXPECTED_ETSY_FILE_TYPES.map((expected) => ({
    fileType: expected.fileType,
    impact: expected.impact,
    label: expected.label,
    required: expected.required,
    status: (expected.satisfiedBy ?? [expected.fileType]).some((fileType) =>
      included.has(fileType),
    )
      ? "included"
      : "missing",
  })) satisfies DashboardCompletenessItem[];
}

function reportCompleteness(report: DashboardReportItem): DashboardCompleteness {
  return {
    includedFileTypes: report.includedFileTypes,
    items: buildCompletenessItems(report.includedFileTypes),
    label: report.completenessLabel,
    missingFileTypes: report.missingFileTypes,
    reportId: report.id,
    source: "report",
    status: report.completenessStatus,
    uploadBatchId: report.uploadBatchId,
    warningCount: report.warningCount,
  };
}

function uploadCompleteness(batch: DashboardUploadBatchItem): DashboardCompleteness {
  const result = analyzeBatchCompleteness(batch.fileTypes);

  return {
    includedFileTypes: result.includedFileTypes,
    items: buildCompletenessItems(result.includedFileTypes),
    label: completenessLabel(result.status),
    missingFileTypes: result.missingFileTypes.map((fileType) => fileType.fileType),
    reportId: null,
    source: "upload",
    status: result.status,
    uploadBatchId: batch.id,
    warningCount: batch.warningCount + result.warnings.length,
  };
}

function emptyCompleteness(): DashboardCompleteness {
  return {
    includedFileTypes: [],
    items: buildCompletenessItems([]),
    label: "No data",
    missingFileTypes: EXPECTED_ETSY_FILE_TYPES.map((fileType) => fileType.fileType),
    reportId: null,
    source: "none",
    status: "none",
    uploadBatchId: null,
    warningCount: 0,
  };
}

function buildNextBestAction(input: {
  latestReport: DashboardReportItem | null;
  latestUploadBatch: DashboardUploadBatchItem | null;
  completeness: DashboardCompleteness;
}): DashboardNextBestAction {
  const { completeness, latestReport, latestUploadBatch } = input;

  if (!latestUploadBatch) {
    return {
      body: "Start with official Etsy CSV exports. FlowSync AI will identify file types, warnings, and the fields available for a Profit Preview.",
      cta: "Upload Etsy CSV",
      href: "/upload",
      title: "Upload your first Etsy CSV files",
      tone: "primary",
    };
  }

  if (!latestReport) {
    return {
      body: "You already have uploaded CSV metadata. Generate the first report preview to see revenue, fees, tax treatment, and profit.",
      cta: "Generate preview",
      href: "/upload",
      title: "Generate a Profit Preview",
      tone: "primary",
    };
  }

  if (completeness.status !== "complete") {
    const missingRequired = completeness.items
      .filter((item) => item.required && item.status === "missing")
      .map((item) => item.label);

    return {
      body:
        missingRequired.length > 0
          ? `Add missing core CSV files: ${missingRequired.join(", ")}. The current report can still be reviewed, but profit may be incomplete.`
          : "Optional files are missing. Add them if they apply to this Etsy shop before sending the report to a CPA.",
      cta: "Add missing files",
      href: "/upload",
      title: "Improve data completeness",
      tone: "warning",
    };
  }

  if (latestReport.warningCount > 0) {
    return {
      body: "Review CSV warnings before using the report for bookkeeping preparation.",
      cta: "Review warnings",
      href: `/reports/${latestReport.id}`,
      title: "Review report warnings",
      tone: "warning",
    };
  }

  if (latestReport.downloadCount === 0) {
    return {
      body: "Your latest report has complete core CSV coverage. Download the Excel workbook and review it before sharing with a CPA.",
      cta: "Download Excel",
      href: `/reports/${latestReport.id}/download`,
      title: "Download the CPA-ready workbook",
      tone: "primary",
    };
  }

  return {
    body: "You have generated and downloaded a report. Send feedback about missing categories or upload another reporting period when ready.",
    cta: "Send feedback",
    href: "/feedback",
    title: "Tell us what would make this worth paying for",
    tone: "neutral",
  };
}

export function buildDashboardSummary(input: {
  reports: readonly DashboardReportRow[];
  uploadBatches: readonly DashboardUploadBatchRow[];
  uploads: readonly DashboardUploadRow[];
  downloads: readonly DashboardDownloadRow[];
}): DashboardSummary {
  const downloadsByReport = countDownloadsByReport(input.downloads);
  const uploadGroups = groupUploadsByBatchId(input.uploads);
  const reports = sortByCreatedAtDesc(input.reports).map((report) =>
    buildReportItem(report, downloadsByReport.get(report.id) ?? 0),
  );
  const uploadBatches = sortByCreatedAtDesc(input.uploadBatches).map((batch) =>
    buildUploadBatchItem(batch, uploadGroups.get(batch.id) ?? []),
  );
  const latestReport = reports[0] ?? null;
  const latestUploadBatch = uploadBatches[0] ?? null;
  const completeness = latestReport
    ? reportCompleteness(latestReport)
    : latestUploadBatch
      ? uploadCompleteness(latestUploadBatch)
      : emptyCompleteness();

  return {
    completeness,
    hasAnyData:
      input.reports.length > 0 ||
      input.uploadBatches.length > 0 ||
      input.uploads.length > 0 ||
      input.downloads.length > 0,
    latestReport,
    latestUploadBatch,
    metrics: {
      latestCurrency: latestReport?.currency ?? null,
      latestGrossSales: latestReport?.grossSales ?? null,
      latestNetProfitAfterCOGS: latestReport?.netProfitAfterCOGS ?? null,
      latestNetProfitBeforeCOGS: latestReport?.netProfitBeforeCOGS ?? null,
      latestProfitMargin: latestReport?.profitMargin ?? null,
      totalDownloads: input.downloads.length,
      totalReports: input.reports.length,
      totalUploadBatches: input.uploadBatches.length,
      totalUploadedFiles: input.uploads.length,
    },
    nextBestAction: buildNextBestAction({
      completeness,
      latestReport,
      latestUploadBatch,
    }),
    recentReports: reports.slice(0, 5),
  };
}
