"use server";

import {
  buildReportHistoryItems,
  type ReportHistoryItem,
} from "@/lib/reports/reportHistory";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const REPORT_HISTORY_SELECT =
  "id,created_at,currency,completeness_status,gross_sales,net_profit_before_cogs,net_profit_after_cogs,warnings_json";

export async function loadReportHistory(limit?: number): Promise<ReportHistoryItem[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let reportsQuery = supabase
    .from("reports")
    .select(REPORT_HISTORY_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (limit) {
    reportsQuery = reportsQuery.limit(limit);
  }

  const { data: reports, error: reportsError } = await reportsQuery;

  if (reportsError || !reports || reports.length === 0) return [];

  const reportIds = reports.map((report) => report.id);
  const { data: downloads, error: downloadsError } = await supabase
    .from("download_events")
    .select("report_id")
    .eq("user_id", user.id)
    .in("report_id", reportIds);

  return buildReportHistoryItems(reports, downloadsError || !downloads ? [] : downloads);
}
