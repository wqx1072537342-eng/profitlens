import { NextResponse } from "next/server";

import {
  type ProfitReportExportRow,
} from "@/lib/reports/exportProfitReportCsv";
import { buildProfitReportXlsx } from "@/lib/reports/exportProfitReportXlsx";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface DownloadRouteProps {
  params: Promise<{
    reportId: string;
  }>;
}

function xlsxFileName(reportId: string) {
  return `profitlens-etsy-profit-report-${reportId.slice(0, 8)}.xlsx`;
}

export async function GET(_request: Request, { params }: DownloadRouteProps) {
  const { reportId } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", _request.url));
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select(
      "id,currency,gross_sales,refunds,fees,ads,shipping,tax_collected,net_profit_before_cogs,net_profit_after_cogs,completeness_status,included_file_types_json,missing_file_types_json,warnings_json,created_at",
    )
    .eq("id", reportId)
    .eq("user_id", user.id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report was not found." }, { status: 404 });
  }

  const { error: downloadError } = await supabase.from("download_events").insert({
    file_type: "xlsx",
    report_id: report.id,
    user_id: user.id,
  });

  if (downloadError) {
    return NextResponse.json(
      { error: "Could not record the report download." },
      { status: 500 },
    );
  }

  const workbook = buildProfitReportXlsx(report as ProfitReportExportRow);

  return new Response(new Uint8Array(workbook), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${xlsxFileName(report.id)}"`,
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    status: 200,
  });
}
