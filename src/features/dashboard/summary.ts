"use server";

import {
  buildDashboardSummary,
  type DashboardSummary,
} from "@/lib/dashboard/dashboardSummary";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoadDashboardSummaryResult =
  | {
      status: "success";
      summary: DashboardSummary;
    }
  | {
      status: "error";
      message: string;
      summary: DashboardSummary;
    };

const emptySummary = buildDashboardSummary({
  downloads: [],
  reports: [],
  uploadBatches: [],
  uploads: [],
});

export async function loadDashboardSummary(): Promise<LoadDashboardSummaryResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      message:
        "Supabase is not configured. Add environment variables before loading dashboard data.",
      status: "error",
      summary: emptySummary,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Log in before loading dashboard data.",
      status: "error",
      summary: emptySummary,
    };
  }

  const [reports, uploadBatches, uploads, downloads] = await Promise.all([
    supabase
      .from("reports")
      .select(
        "id,upload_batch_id,status,currency,gross_sales,refunds,fees,ads,shipping,tax_collected,net_profit_before_cogs,net_profit_after_cogs,warnings_json,completeness_status,included_file_types_json,missing_file_types_json,created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("upload_batches")
      .select("id,status,file_count,warning_count,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("uploads")
      .select(
        "id,upload_batch_id,file_name,file_type,file_size_bytes,row_count,warnings_json,created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("download_events")
      .select("id,report_id,file_type,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const failed = [reports, uploadBatches, uploads, downloads].find(
    (result) => result.error,
  );

  if (failed?.error) {
    return {
      message: failed.error.message,
      status: "error",
      summary: emptySummary,
    };
  }

  return {
    status: "success",
    summary: buildDashboardSummary({
      downloads: downloads.data ?? [],
      reports: reports.data ?? [],
      uploadBatches: uploadBatches.data ?? [],
      uploads: uploads.data ?? [],
    }),
  };
}
