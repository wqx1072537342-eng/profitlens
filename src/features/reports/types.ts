import type { CsvWarning } from "@/lib/etsy-reconcile/types";

export interface ProfitPreviewCsvInput {
  fileName: string;
  text: string;
}

export interface GenerateProfitPreviewInput {
  uploadBatchId: string;
  files: ProfitPreviewCsvInput[];
}

export type GenerateProfitPreviewResult =
  | {
      status: "success";
      message: string;
      reportId: string;
      warnings: CsvWarning[];
    }
  | {
      status: "error";
      message: string;
      reportId?: never;
      warnings?: never;
    };
