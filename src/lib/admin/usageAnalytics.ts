import type { Json } from "@/lib/supabase/types";

export interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
}

export interface AdminUploadBatchRow {
  id: string;
  user_id: string;
  created_at: string;
}

export interface AdminUploadRow {
  id: string;
  user_id: string;
}

export interface AdminReportRow {
  id: string;
  user_id: string;
  created_at: string;
  currency: string;
  gross_sales: number;
  net_profit_before_cogs: number;
  net_profit_after_cogs: number;
  warnings_json: Json;
}

export interface AdminDownloadRow {
  id: string;
  user_id: string;
  report_id: string;
  file_type: string;
  created_at: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalUploadBatches: number;
  totalUploadedFiles: number;
  totalReports: number;
  totalDownloads: number;
  usersWithAtLeastOneReport: number;
  usersWithAtLeastOneDownload: number;
}

export interface RecentAdminReport {
  id: string;
  userEmail: string;
  createdAt: string;
  currency: string;
  grossSales: number;
  netProfitBeforeCOGS: number;
  netProfitAfterCOGS: number;
  warningCount: number;
  downloadCount: number;
}

export interface RecentAdminDownload {
  id: string;
  userEmail: string;
  reportId: string;
  fileType: string;
  createdAt: string;
}

export interface AdminUsageDashboard {
  metrics: AdminMetrics;
  recentReports: RecentAdminReport[];
  recentDownloads: RecentAdminDownload[];
}

function warningCountFromJson(value: Json): number {
  return Array.isArray(value) ? value.length : 0;
}

function countByReport(downloads: readonly AdminDownloadRow[]) {
  const counts = new Map<string, number>();

  for (const download of downloads) {
    counts.set(download.report_id, (counts.get(download.report_id) ?? 0) + 1);
  }

  return counts;
}

function emailMap(users: readonly AdminUserRow[]) {
  return new Map(users.map((user) => [user.id, user.email]));
}

export function isAdminEmail(email: string | null | undefined, adminList: string) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  return adminList
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalizedEmail);
}

export function buildAdminUsageDashboard(input: {
  users: readonly AdminUserRow[];
  uploadBatches: readonly AdminUploadBatchRow[];
  uploads: readonly AdminUploadRow[];
  reports: readonly AdminReportRow[];
  downloads: readonly AdminDownloadRow[];
}): AdminUsageDashboard {
  const reportUserIds = new Set(input.reports.map((report) => report.user_id));
  const downloadUserIds = new Set(input.downloads.map((download) => download.user_id));
  const downloadsByReport = countByReport(input.downloads);
  const usersById = emailMap(input.users);

  return {
    metrics: {
      totalDownloads: input.downloads.length,
      totalReports: input.reports.length,
      totalUploadBatches: input.uploadBatches.length,
      totalUploadedFiles: input.uploads.length,
      totalUsers: input.users.length,
      usersWithAtLeastOneDownload: downloadUserIds.size,
      usersWithAtLeastOneReport: reportUserIds.size,
    },
    recentDownloads: [...input.downloads]
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 10)
      .map((download) => ({
        createdAt: download.created_at,
        fileType: download.file_type,
        id: download.id,
        reportId: download.report_id,
        userEmail: usersById.get(download.user_id) ?? "Unknown user",
      })),
    recentReports: [...input.reports]
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 10)
      .map((report) => ({
        createdAt: report.created_at,
        currency: report.currency,
        downloadCount: downloadsByReport.get(report.id) ?? 0,
        grossSales: report.gross_sales,
        id: report.id,
        netProfitAfterCOGS: report.net_profit_after_cogs,
        netProfitBeforeCOGS: report.net_profit_before_cogs,
        userEmail: usersById.get(report.user_id) ?? "Unknown user",
        warningCount: warningCountFromJson(report.warnings_json),
      })),
  };
}
