import type { CsvRow, CsvWarning } from "@/lib/etsy-reconcile/types";

export interface UploadFileMetadata {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  rowCount: number;
  headers: string[];
  rows: CsvRow[];
  previewRows: CsvRow[];
  warnings: CsvWarning[];
}

export interface SaveUploadBatchInput {
  files: UploadFileMetadata[];
  uploadBatchId?: string;
}

export interface UploadWorkspaceFile {
  id?: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  rowCount: number;
  warningCount: number;
  createdAt?: string;
}

export interface UploadWorkspaceBatch {
  batchId: string;
  status: string;
  fileCount: number;
  warningCount: number;
  files: UploadWorkspaceFile[];
}

export type SaveUploadBatchResult =
  | {
      status: "success";
      message: string;
      batchId: string;
      workspace: UploadWorkspaceBatch;
    }
  | {
      status: "error";
      message: string;
      batchId?: never;
      workspace?: never;
    };
