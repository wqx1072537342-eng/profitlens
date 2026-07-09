"use server";

import { redirect } from "next/navigation";

import type { CsvRow, CsvWarning } from "@/lib/etsy-reconcile/types";
import {
  calculateUploadedReconciliationFromParsedRows,
  type UploadedCsvType,
  type UploadedParsedCsvInput,
} from "@/lib/etsy-reconcile/uploadedReconciliation";
import { analyzeBatchCompleteness } from "@/lib/reports/batchCompleteness";
import { buildProfitPreviewSummary } from "@/lib/reports/buildProfitPreviewSummary";
import { canDeleteReport, deleteReportRedirectPath } from "@/lib/reports/deleteReportPolicy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

import type { GenerateProfitPreviewInput, GenerateProfitPreviewResult } from "./types";

function validatePreviewInput(input: GenerateProfitPreviewInput) {
  if (!input.uploadBatchId.trim()) {
    return "Upload batch is missing. Save CSV metadata before generating a preview.";
  }

  return null;
}

function serializeWarnings(warnings: readonly CsvWarning[]): Json {
  return warnings.map((warning) => ({
    code: warning.code,
    field: warning.field ?? null,
    filePath: warning.filePath ?? null,
    message: warning.message,
    row: warning.row ?? null,
    value: warning.value ?? null,
  })) as Json;
}

function jsonToStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function jsonToRows(value: Json): CsvRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, Json | undefined> => {
      return Boolean(item) && typeof item === "object" && !Array.isArray(item);
    })
    .map((item) => {
      const row: CsvRow = {};
      for (const [key, fieldValue] of Object.entries(item)) {
        row[key] = typeof fieldValue === "string" ? fieldValue : String(fieldValue ?? "");
      }
      return row;
    });
}

function isUploadedCsvType(value: string): value is UploadedCsvType {
  return [
    "orders",
    "refunds",
    "fees",
    "ads",
    "offsiteAds",
    "shippingLabels",
    "salesTax",
    "deposits",
    "reserves",
    "chargebacks",
    "taxes",
    "feeAdjustments",
    "cogs",
    "bankStatements",
    "unknown",
  ].includes(value);
}

export async function generateProfitPreviewAction(
  input: GenerateProfitPreviewInput,
): Promise<GenerateProfitPreviewResult> {
  const validationMessage = validatePreviewInput(input);
  if (validationMessage) {
    return {
      message: validationMessage,
      status: "error",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      message:
        "Supabase is not configured. Add the required environment variables before generating a preview.",
      status: "error",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Log in before generating a Profit Preview.",
      status: "error",
    };
  }

  const { data: batch, error: batchError } = await supabase
    .from("upload_batches")
    .select("id")
    .eq("id", input.uploadBatchId)
    .eq("user_id", user.id)
    .single();

  if (batchError || !batch) {
    return {
      message: batchError?.message ?? "Upload batch was not found for this account.",
      status: "error",
    };
  }

  const { data: uploads, error: uploadsError } = await supabase
    .from("uploads")
    .select("file_name,file_type,headers_json,rows_json")
    .eq("upload_batch_id", batch.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (uploadsError || !uploads) {
    return {
      message: uploadsError?.message ?? "Could not load uploaded CSV rows.",
      status: "error",
    };
  }

  if (uploads.length === 0) {
    return {
      message: "Upload at least one Etsy CSV before generating a Profit Preview.",
      status: "error",
    };
  }

  try {
    const parsedUploads: UploadedParsedCsvInput[] = uploads.map((upload) => ({
      fileName: upload.file_name,
      fileType: isUploadedCsvType(upload.file_type) ? upload.file_type : "unknown",
      headers: jsonToStringArray(upload.headers_json),
      rows: jsonToRows(upload.rows_json),
    }));
    const completeness = analyzeBatchCompleteness(
      parsedUploads.map((upload) => upload.fileType),
    );
    const reconciliation =
      await calculateUploadedReconciliationFromParsedRows(parsedUploads);
    const summary = buildProfitPreviewSummary(reconciliation.report);
    const warnings = [...summary.warnings, ...completeness.warnings];
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        ads: summary.ads,
        completeness_status: completeness.status,
        currency: summary.currency,
        fees: summary.fees,
        gross_sales: summary.grossSales,
        included_file_types_json: completeness.includedFileTypes as unknown as Json,
        missing_file_types_json: completeness.missingFileTypes.map(
          (fileType) => fileType.fileType,
        ) as unknown as Json,
        net_profit_after_cogs: summary.netProfitAfterCOGS,
        net_profit_before_cogs: summary.netProfitBeforeCOGS,
        refunds: summary.refunds,
        shipping: summary.shipping,
        status: "preview",
        tax_collected: summary.taxCollected,
        upload_batch_id: batch.id,
        user_id: user.id,
        warnings_json: serializeWarnings(warnings),
      })
      .select("id")
      .single();

    if (reportError || !report) {
      return {
        message: reportError?.message ?? "Could not save Profit Preview.",
        status: "error",
      };
    }

    return {
      completenessStatus: completeness.status,
      message:
        completeness.status === "complete"
          ? "Profit Preview generated from a complete core CSV set."
          : "Profit Preview generated with missing file warnings.",
      missingFileTypes: completeness.missingFileTypes.map((fileType) => fileType.fileType),
      reportId: report.id,
      status: "success",
      warnings,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Could not generate Profit Preview from the selected CSV files.",
      status: "error",
    };
  }
}

export async function deleteReportAction(formData: FormData) {
  const reportId = String(formData.get("reportId") ?? "").trim();

  if (!reportId) {
    redirect(deleteReportRedirectPath());
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: report } = await supabase
    .from("reports")
    .select("id,user_id")
    .eq("id", reportId)
    .single();

  if (canDeleteReport({ currentUserId: user.id, reportUserId: report?.user_id })) {
    await supabase.from("reports").delete().eq("id", reportId).eq("user_id", user.id);
  }

  redirect(deleteReportRedirectPath());
}
