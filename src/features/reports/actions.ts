"use server";

import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES,
} from "@/lib/csv-upload/analyzeEtsyCsvUpload";
import type { CsvWarning } from "@/lib/etsy-reconcile/types";
import { calculateUploadedReconciliation } from "@/lib/etsy-reconcile/uploadedReconciliation";
import { buildProfitPreviewSummary } from "@/lib/reports/buildProfitPreviewSummary";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

import type {
  GenerateProfitPreviewInput,
  GenerateProfitPreviewResult,
  ProfitPreviewCsvInput,
} from "./types";

function validatePreviewInput(input: GenerateProfitPreviewInput) {
  if (!input.uploadBatchId.trim()) {
    return "Upload batch is missing. Save CSV metadata before generating a preview.";
  }

  if (input.files.length === 0) {
    return "Choose at least one CSV file before generating a preview.";
  }

  if (input.files.length > MAX_UPLOAD_FILES) {
    return `Profit Preview can use at most ${MAX_UPLOAD_FILES} CSV files.`;
  }

  for (const file of input.files) {
    if (!file.fileName.trim() || !file.fileName.toLowerCase().endsWith(".csv")) {
      return "Every uploaded file must be a CSV file.";
    }

    if (Buffer.byteLength(file.text, "utf8") > MAX_UPLOAD_FILE_SIZE_BYTES) {
      return `Each CSV file must be ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes or smaller.`;
    }
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

  try {
    const reconciliation = await calculateUploadedReconciliation(
      input.files.map((file): ProfitPreviewCsvInput => ({
        fileName: file.fileName,
        text: file.text,
      })),
    );
    const summary = buildProfitPreviewSummary(reconciliation.report);
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        ads: summary.ads,
        currency: summary.currency,
        fees: summary.fees,
        gross_sales: summary.grossSales,
        net_profit_after_cogs: summary.netProfitAfterCOGS,
        net_profit_before_cogs: summary.netProfitBeforeCOGS,
        refunds: summary.refunds,
        shipping: summary.shipping,
        status: "preview",
        tax_collected: summary.taxCollected,
        upload_batch_id: batch.id,
        user_id: user.id,
        warnings_json: serializeWarnings(summary.warnings),
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
      message: "Profit Preview generated.",
      reportId: report.id,
      status: "success",
      warnings: summary.warnings,
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
