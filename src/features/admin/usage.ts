"use server";

import { getCurrentUser } from "@/features/auth/session";
import {
  buildAdminUsageDashboard,
  isAdminEmail,
  type AdminUsageDashboard,
} from "@/lib/admin/usageAnalytics";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminUsageResult =
  | {
      status: "success";
      dashboard: AdminUsageDashboard;
    }
  | {
      status: "unauthorized";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function loadAdminUsageDashboard(): Promise<AdminUsageResult> {
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    return {
      message: "Log in before viewing admin usage data.",
      status: "unauthorized",
    };
  }

  const adminEmails =
    process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

  if (!isAdminEmail(user.email, adminEmails)) {
    return {
      message: "This account is not allowed to view admin usage data.",
      status: "unauthorized",
    };
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message:
        "Admin dashboard is not configured. Set ADMIN_EMAIL and SUPABASE_SERVICE_ROLE_KEY.",
      status: "error",
    };
  }

  const [users, uploadBatches, uploads, reports, downloads] = await Promise.all([
    supabase.from("users").select("id,email,created_at"),
    supabase.from("upload_batches").select("id,user_id,created_at"),
    supabase.from("uploads").select("id,user_id"),
    supabase
      .from("reports")
      .select(
        "id,user_id,created_at,currency,gross_sales,net_profit_before_cogs,net_profit_after_cogs,warnings_json",
      ),
    supabase
      .from("download_events")
      .select("id,user_id,report_id,file_type,created_at"),
  ]);

  const failed = [users, uploadBatches, uploads, reports, downloads].find(
    (result) => result.error,
  );

  if (failed?.error) {
    return {
      message: failed.error.message,
      status: "error",
    };
  }

  return {
    dashboard: buildAdminUsageDashboard({
      downloads: downloads.data ?? [],
      reports: reports.data ?? [],
      uploadBatches: uploadBatches.data ?? [],
      uploads: uploads.data ?? [],
      users: users.data ?? [],
    }),
    status: "success",
  };
}
