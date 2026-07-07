"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES,
} from "@/lib/csv-upload/analyzeEtsyCsvUpload";

import type { SaveUploadBatchResult, UploadFileMetadata } from "./types";

function uploadStatusForWarnings(warningCount: number) {
  return warningCount > 0 ? "warning" : "parsed";
}

function validateUploadFiles(files: UploadFileMetadata[]) {
  if (files.length === 0) {
    return "Choose at least one CSV file before saving upload metadata.";
  }

  if (files.length > MAX_UPLOAD_FILES) {
    return `Upload batches can contain at most ${MAX_UPLOAD_FILES} CSV files.`;
  }

  for (const file of files) {
    if (!file.fileName.trim() || !file.fileName.toLowerCase().endsWith(".csv")) {
      return "Every uploaded file must be a CSV file.";
    }

    if (
      !Number.isFinite(file.fileSizeBytes) ||
      file.fileSizeBytes < 0 ||
      file.fileSizeBytes > MAX_UPLOAD_FILE_SIZE_BYTES
    ) {
      return `Each CSV file must be ${MAX_UPLOAD_FILE_SIZE_BYTES} bytes or smaller.`;
    }

    if (!Number.isFinite(file.rowCount) || file.rowCount < 0) {
      return "CSV row counts must be valid non-negative numbers.";
    }

    if (
      !Array.isArray(file.headers) ||
      !Array.isArray(file.previewRows) ||
      !Array.isArray(file.warnings)
    ) {
      return "CSV metadata is incomplete.";
    }
  }

  return null;
}

export async function saveUploadBatchAction(
  files: UploadFileMetadata[],
): Promise<SaveUploadBatchResult> {
  const validationMessage = validateUploadFiles(files);
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
        "Supabase is not configured. Add the required environment variables before uploading.",
      status: "error",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Log in before saving uploaded CSV metadata.",
      status: "error",
    };
  }

  const warningCount = files.reduce((sum, file) => sum + file.warnings.length, 0);
  const batchStatus = uploadStatusForWarnings(warningCount);
  const { data: batch, error: batchError } = await supabase
    .from("upload_batches")
    .insert({
      file_count: files.length,
      status: batchStatus,
      user_id: user.id,
      warning_count: warningCount,
    })
    .select("id")
    .single();

  if (batchError || !batch) {
    return {
      message: batchError?.message ?? "Could not create upload batch.",
      status: "error",
    };
  }

  const uploadRows = files.map((file) => ({
    file_name: file.fileName,
    file_size_bytes: file.fileSizeBytes,
    file_type: file.fileType,
    headers_json: file.headers as unknown as Json,
    preview_rows_json: file.previewRows as unknown as Json,
    row_count: file.rowCount,
    status: uploadStatusForWarnings(file.warnings.length),
    upload_batch_id: batch.id,
    user_id: user.id,
    warnings_json: file.warnings as unknown as Json,
  }));

  const { error: uploadsError } = await supabase.from("uploads").insert(uploadRows);

  if (uploadsError) {
    return {
      message: uploadsError.message,
      status: "error",
    };
  }

  return {
    batchId: batch.id,
    message:
      warningCount > 0
        ? "CSV metadata saved with warnings to review."
        : "CSV metadata saved successfully.",
    status: "success",
  };
}
