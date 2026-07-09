import type { CsvWarning } from "@/lib/etsy-reconcile/types";
import type { ReportCompletenessStatus } from "@/lib/reports/batchCompleteness";

export interface GenerateProfitPreviewInput {
  uploadBatchId: string;
}

export type GenerateProfitPreviewResult =
  | {
      status: "success";
      message: string;
      reportId: string;
      completenessStatus: ReportCompletenessStatus;
      missingFileTypes: string[];
      warnings: CsvWarning[];
    }
  | {
      status: "error";
      message: string;
      reportId?: never;
      warnings?: never;
    };
