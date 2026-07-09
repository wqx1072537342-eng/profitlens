"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES,
} from "@/lib/csv-upload/analyzeEtsyCsvUpload";

import type {
  SaveUploadBatchInput,
  SaveUploadBatchResult,
  UploadFileMetadata,
  UploadWorkspaceBatch,
  UploadWorkspaceFile,
} from "./types";

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
      !Array.isArray(file.rows) ||
      !Array.isArray(file.previewRows) ||
      !Array.isArray(file.warnings)
    ) {
      return "CSV metadata is incomplete.";
    }
  }

  return null;
}

function uploadDatabaseErrorMessage(message: string) {
  if (message.includes("rows_json")) {
    return [
      "Upload storage is missing the uploads.rows_json column in Supabase.",
      "Run migration 202607070002_add_batch_workspace_fields.sql, then refresh Supabase schema cache if the error remains.",
    ].join(" ");
  }

  return message;
}

function warningCountFromJson(value: Json) {
  return Array.isArray(value) ? value.length : 0;
}

function uploadFileFromRow(row: {
  id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  row_count: number;
  warnings_json: Json;
  created_at: string;
}): UploadWorkspaceFile {
  return {
    createdAt: row.created_at,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    fileType: row.file_type,
    id: row.id,
    rowCount: row.row_count,
    warningCount: warningCountFromJson(row.warnings_json),
  };
}

async function loadUploadWorkspace(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  batchId: string,
): Promise<UploadWorkspaceBatch | null> {
  const { data: batch, error: batchError } = await supabase
    .from("upload_batches")
    .select("id,status,file_count,warning_count")
    .eq("id", batchId)
    .single();

  if (batchError || !batch) return null;

  const { data: uploads, error: uploadsError } = await supabase
    .from("uploads")
    .select("id,file_name,file_type,file_size_bytes,row_count,warnings_json,created_at")
    .eq("upload_batch_id", batch.id)
    .order("created_at", { ascending: true });

  if (uploadsError || !uploads) return null;

  return {
    batchId: batch.id,
    fileCount: batch.file_count,
    files: uploads.map(uploadFileFromRow),
    status: batch.status,
    warningCount: batch.warning_count,
  };
}

export async function loadLatestUploadWorkspace(): Promise<UploadWorkspaceBatch | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: batch, error: batchError } = await supabase
    .from("upload_batches")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (batchError || !batch) return null;

  return loadUploadWorkspace(supabase, batch.id);
}

export async function saveUploadBatchAction(
  input: SaveUploadBatchInput,
): Promise<SaveUploadBatchResult> {
  const { files, uploadBatchId } = input;
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
  let batchId = uploadBatchId;

  if (batchId) {
    const { data: existingBatch, error: existingBatchError } = await supabase
      .from("upload_batches")
      .select("id")
      .eq("id", batchId)
      .eq("user_id", user.id)
      .single();

    if (existingBatchError || !existingBatch) {
      return {
        message:
          existingBatchError?.message ?? "Upload batch was not found for this account.",
        status: "error",
      };
    }
  } else {
    const { data: batch, error: batchError } = await supabase
      .from("upload_batches")
      .insert({
        file_count: 0,
        status: "draft",
        user_id: user.id,
        warning_count: 0,
      })
      .select("id")
      .single();

    if (batchError || !batch) {
      return {
        message: batchError?.message ?? "Could not create upload batch.",
        status: "error",
      };
    }

    batchId = batch.id;
  }

  const uploadRows = files.map((file) => ({
    file_name: file.fileName,
    file_size_bytes: file.fileSizeBytes,
    file_type: file.fileType,
    headers_json: file.headers as unknown as Json,
    preview_rows_json: file.previewRows as unknown as Json,
    rows_json: file.rows as unknown as Json,
    row_count: file.rowCount,
    status: uploadStatusForWarnings(file.warnings.length),
    upload_batch_id: batchId,
    user_id: user.id,
    warnings_json: file.warnings as unknown as Json,
  }));

  const { error: uploadsError } = await supabase.from("uploads").insert(uploadRows);

  if (uploadsError) {
    return {
      message: uploadDatabaseErrorMessage(uploadsError.message),
      status: "error",
    };
  }

  const workspaceBeforeUpdate = await loadUploadWorkspace(supabase, batchId);
  if (!workspaceBeforeUpdate) {
    return {
      message: "CSV files were saved, but the upload workspace could not be loaded.",
      status: "error",
    };
  }

  const totalWarnings = workspaceBeforeUpdate.files.reduce(
    (sum, file) => sum + file.warningCount,
    0,
  );
  const { error: updateError } = await supabase
    .from("upload_batches")
    .update({
      file_count: workspaceBeforeUpdate.files.length,
      status: uploadStatusForWarnings(totalWarnings),
      warning_count: totalWarnings,
    })
    .eq("id", batchId)
    .eq("user_id", user.id);

  if (updateError) {
    return {
      message: updateError.message,
      status: "error",
    };
  }

  const workspace = await loadUploadWorkspace(supabase, batchId);
  if (!workspace) {
    return {
      message: "CSV files were saved, but the upload workspace could not be reloaded.",
      status: "error",
    };
  }

  return {
    batchId,
    message:
      warningCount > 0
        ? "CSV files were added to this report batch with warnings to review."
        : "CSV files were added to this report batch.",
    status: "success",
    workspace,
  };
}
