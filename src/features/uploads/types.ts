import type { CsvRow, CsvWarning } from "@/lib/etsy-reconcile/types";

export interface UploadFileMetadata {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  rowCount: number;
  headers: string[];
  previewRows: CsvRow[];
  warnings: CsvWarning[];
}

export interface SaveUploadBatchResult {
  status: "success" | "error";
  message: string;
  batchId?: string;
}
