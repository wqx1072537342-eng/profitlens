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

export interface AdminWaitlistSubmissionRow {
  id: string;
  email: string;
  interest: string;
  source_page: string;
  created_at: string;
}

export interface AdminFeedbackSubmissionRow {
  id: string;
  user_id: string | null;
  email: string | null;
  topic: string;
  message: string;
  created_at: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalUploadBatches: number;
  totalUploadedFiles: number;
  totalReports: number;
  totalDownloads: number;
  usersWithAtLeastOneUpload: number;
  usersWithAtLeastOneReport: number;
  usersWithAtLeastOneDownload: number;
  highIntentUsers: number;
  reportsWithWarnings: number;
  reportWarningRate: number;
  signupToUploadRate: number;
  uploadToReportRate: number;
  reportToDownloadRate: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  reportsLast7Days: number;
  reportsLast30Days: number;
  downloadsLast7Days: number;
  downloadsLast30Days: number;
  totalWaitlistSubmissions: number;
  totalFeedbackSubmissions: number;
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

export interface RecentAdminWaitlistSubmission {
  id: string;
  email: string;
  interest: string;
  sourcePage: string;
  createdAt: string;
}

export interface RecentAdminFeedbackSubmission {
  id: string;
  userEmail: string;
  topic: string;
  message: string;
  createdAt: string;
}

export interface AdminUsageDashboard {
  metrics: AdminMetrics;
  conversionFunnel: AdminFunnelStep[];
  highIntentUsers: AdminHighIntentUser[];
  recentReports: RecentAdminReport[];
  recentDownloads: RecentAdminDownload[];
  recentWaitlistSubmissions: RecentAdminWaitlistSubmission[];
  recentFeedbackSubmissions: RecentAdminFeedbackSubmission[];
}

export interface AdminFunnelStep {
  label: string;
  userCount: number;
  conversionRate: number;
  description: string;
}

export interface AdminHighIntentUser {
  userId: string;
  email: string;
  signupAt: string;
  uploadBatchCount: number;
  uploadFileCount: number;
  reportCount: number;
  downloadCount: number;
  warningCount: number;
  lastActivityAt: string;
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

function daysAgo(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function isWithinDays(value: string, days: number) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= daysAgo(days);
}

function percent(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.min(100, Math.round((numerator / denominator) * 1000) / 10);
}

function maxDate(values: readonly string[]) {
  return values
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left))[0];
}

function countByUserId<T extends { user_id: string }>(rows: readonly T[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  return counts;
}

function groupReportsByUser(reports: readonly AdminReportRow[]) {
  const groups = new Map<string, AdminReportRow[]>();

  for (const report of reports) {
    const existing = groups.get(report.user_id) ?? [];
    existing.push(report);
    groups.set(report.user_id, existing);
  }

  return groups;
}

function highIntentUserRows(input: {
  users: readonly AdminUserRow[];
  uploadBatches: readonly AdminUploadBatchRow[];
  uploads: readonly AdminUploadRow[];
  reports: readonly AdminReportRow[];
  downloads: readonly AdminDownloadRow[];
}): AdminHighIntentUser[] {
  const uploadBatchCounts = countByUserId(input.uploadBatches);
  const uploadFileCounts = countByUserId(input.uploads);
  const reportCounts = countByUserId(input.reports);
  const downloadCounts = countByUserId(input.downloads);
  const reportsByUser = groupReportsByUser(input.reports);

  return input.users
    .map((user) => {
      const userReports = reportsByUser.get(user.id) ?? [];
      const warningCount = userReports.reduce(
        (sum, report) => sum + warningCountFromJson(report.warnings_json),
        0,
      );
      const activityDates = [
        user.created_at,
        ...input.uploadBatches
          .filter((batch) => batch.user_id === user.id)
          .map((batch) => batch.created_at),
        ...input.reports
          .filter((report) => report.user_id === user.id)
          .map((report) => report.created_at),
        ...input.downloads
          .filter((download) => download.user_id === user.id)
          .map((download) => download.created_at),
      ];

      return {
        downloadCount: downloadCounts.get(user.id) ?? 0,
        email: user.email,
        lastActivityAt: maxDate(activityDates) ?? user.created_at,
        reportCount: reportCounts.get(user.id) ?? 0,
        signupAt: user.created_at,
        uploadBatchCount: uploadBatchCounts.get(user.id) ?? 0,
        uploadFileCount: uploadFileCounts.get(user.id) ?? 0,
        userId: user.id,
        warningCount,
      };
    })
    .filter(
      (user) =>
        user.uploadBatchCount > 0 && user.reportCount > 0 && user.downloadCount > 0,
    )
    .sort((left, right) => right.lastActivityAt.localeCompare(left.lastActivityAt))
    .slice(0, 10);
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
  waitlistSubmissions?: readonly AdminWaitlistSubmissionRow[];
  feedbackSubmissions?: readonly AdminFeedbackSubmissionRow[];
}): AdminUsageDashboard {
  const waitlistSubmissions = input.waitlistSubmissions ?? [];
  const feedbackSubmissions = input.feedbackSubmissions ?? [];
  const uploadUserIds = new Set(input.uploadBatches.map((batch) => batch.user_id));
  const reportUserIds = new Set(input.reports.map((report) => report.user_id));
  const downloadUserIds = new Set(input.downloads.map((download) => download.user_id));
  const downloadsByReport = countByReport(input.downloads);
  const usersById = emailMap(input.users);
  const reportsWithWarnings = input.reports.filter(
    (report) => warningCountFromJson(report.warnings_json) > 0,
  ).length;
  const highIntentUsers = highIntentUserRows(input);
  const signupToUploadRate = percent(uploadUserIds.size, input.users.length);
  const uploadToReportRate = percent(reportUserIds.size, uploadUserIds.size);
  const reportToDownloadRate = percent(downloadUserIds.size, reportUserIds.size);

  return {
    conversionFunnel: [
      {
        conversionRate: 100,
        description: "Registered users in public.users.",
        label: "Signed up",
        userCount: input.users.length,
      },
      {
        conversionRate: signupToUploadRate,
        description: "Users who created at least one upload batch.",
        label: "Uploaded CSV",
        userCount: uploadUserIds.size,
      },
      {
        conversionRate: uploadToReportRate,
        description: "Users who generated at least one Profit Preview.",
        label: "Generated report",
        userCount: reportUserIds.size,
      },
      {
        conversionRate: reportToDownloadRate,
        description: "Users who downloaded at least one Excel workbook.",
        label: "Downloaded Excel",
        userCount: downloadUserIds.size,
      },
    ],
    highIntentUsers,
    metrics: {
      downloadsLast30Days: input.downloads.filter((download) =>
        isWithinDays(download.created_at, 30),
      ).length,
      downloadsLast7Days: input.downloads.filter((download) =>
        isWithinDays(download.created_at, 7),
      ).length,
      highIntentUsers: highIntentUsers.length,
      newUsersLast30Days: input.users.filter((user) =>
        isWithinDays(user.created_at, 30),
      ).length,
      newUsersLast7Days: input.users.filter((user) => isWithinDays(user.created_at, 7))
        .length,
      reportsLast30Days: input.reports.filter((report) =>
        isWithinDays(report.created_at, 30),
      ).length,
      reportsLast7Days: input.reports.filter((report) =>
        isWithinDays(report.created_at, 7),
      ).length,
      reportToDownloadRate,
      reportsWithWarnings,
      reportWarningRate: percent(reportsWithWarnings, input.reports.length),
      signupToUploadRate,
      totalDownloads: input.downloads.length,
      totalFeedbackSubmissions: feedbackSubmissions.length,
      totalReports: input.reports.length,
      totalUploadBatches: input.uploadBatches.length,
      totalUploadedFiles: input.uploads.length,
      totalUsers: input.users.length,
      totalWaitlistSubmissions: waitlistSubmissions.length,
      uploadToReportRate,
      usersWithAtLeastOneUpload: uploadUserIds.size,
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
    recentFeedbackSubmissions: [...feedbackSubmissions]
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 10)
      .map((feedback) => ({
        createdAt: feedback.created_at,
        id: feedback.id,
        message: feedback.message,
        topic: feedback.topic,
        userEmail:
          (feedback.user_id ? usersById.get(feedback.user_id) : null) ??
          feedback.email ??
          "Anonymous",
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
    recentWaitlistSubmissions: [...waitlistSubmissions]
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .slice(0, 10)
      .map((submission) => ({
        createdAt: submission.created_at,
        email: submission.email,
        id: submission.id,
        interest: submission.interest,
        sourcePage: submission.source_page,
      })),
  };
}
