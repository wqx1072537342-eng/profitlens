import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

interface ReportPageProps {
  params: Promise<{
    reportId: string;
  }>;
}

interface WarningView {
  code: string;
  message: string;
  filePath?: string | null;
  row?: number | null;
  field?: string | null;
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      currency,
      style: "currency",
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function jsonToWarnings(value: Json): WarningView[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, Json | undefined> => {
      return Boolean(item) && typeof item === "object" && !Array.isArray(item);
    })
    .map((item) => ({
      code: typeof item.code === "string" ? item.code : "WARNING",
      field: typeof item.field === "string" ? item.field : null,
      filePath: typeof item.filePath === "string" ? item.filePath : null,
      message: typeof item.message === "string" ? item.message : "Review this CSV row.",
      row: typeof item.row === "number" ? item.row : null,
    }));
}

function MetricCard({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default async function ReportPreviewPage({ params }: ReportPageProps) {
  const { reportId } = await params;
  const { isConfigured, user } = await getCurrentUser();

  if (!isConfigured || !user) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (error || !report) {
    notFound();
  }

  const currency = report.currency || "USD";
  const warnings = jsonToWarnings(report.warnings_json);
  const cogsMissing = report.net_profit_before_cogs === report.net_profit_after_cogs;

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              Profit Preview
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Etsy Profit Preview
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Generated from your uploaded Etsy CSV metadata and the current CSV
              selection. This is bookkeeping preparation, not tax advice.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/upload"
          >
            Upload more CSVs
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="Source: Etsy orders CSV. Includes item sales, shipping income, and seller-funded discounts."
          label="Gross Sales"
          value={formatMoney(report.gross_sales, currency)}
        />
        <MetricCard
          description="Source: refunds and case or chargeback CSV rows when uploaded."
          label="Refunds"
          value={formatMoney(report.refunds, currency)}
        />
        <MetricCard
          description="Source: fees CSV, fee adjustments, and chargeback fees."
          label="Etsy Fees"
          value={formatMoney(report.fees, currency)}
        />
        <MetricCard
          description="Source: Etsy Ads and Offsite Ads CSV files."
          label="Ads"
          value={formatMoney(report.ads, currency)}
        />
        <MetricCard
          description="Source: shipping labels CSV. Shipping label refunds reduce this cost."
          label="Shipping Labels"
          value={formatMoney(report.shipping, currency)}
        />
        <MetricCard
          description="Source: sales tax, VAT, GST, and marketplace collected tax rows. These are excluded from profit."
          label="Sales Tax / VAT / GST"
          value={formatMoney(report.tax_collected, currency)}
        />
        <MetricCard
          description="Profit before product cost, packaging, and external fulfillment cost."
          label="Net Profit Before COGS"
          value={formatMoney(report.net_profit_before_cogs, currency)}
        />
        <MetricCard
          description="Operating profit after COGS only when a COGS CSV was included."
          label="Net Profit After COGS"
          value={formatMoney(report.net_profit_after_cogs, currency)}
        />
      </section>

      {cogsMissing ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <h2 className="text-lg font-black">COGS not filled</h2>
          <p className="mt-2 text-sm leading-6">
            Product cost, packaging cost, and external fulfillment cost were not
            detected in this preview. Net Profit After COGS currently matches Net
            Profit Before COGS, so the report is not a complete operating profit view.
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Warnings
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Items to review before sending to a CPA
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {warnings.length} warning{warnings.length === 1 ? "" : "s"}
          </p>
        </div>

        {warnings.length === 0 ? (
          <p className="mt-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-950">
            No warnings were detected from the uploaded CSV files.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {warnings.map((warning, index) => (
              <div
                className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                key={`${warning.code}-${warning.filePath ?? "file"}-${warning.row ?? index}`}
              >
                <p className="font-black">{warning.code}</p>
                <p className="mt-1">{warning.message}</p>
                <p className="mt-1 text-xs text-amber-800">
                  {[warning.filePath, warning.field, warning.row ? `Row ${warning.row}` : null]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
