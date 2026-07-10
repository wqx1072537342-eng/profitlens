"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { generateProfitPreviewAction } from "@/features/reports/actions";
import type { GenerateProfitPreviewResult } from "@/features/reports/types";
import {
  analyzeEtsyCsvUpload,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES,
  type EtsyCsvUploadAnalysis,
} from "@/lib/csv-upload/analyzeEtsyCsvUpload";
import { calculateUploadedReconciliationFromParsedRows } from "@/lib/etsy-reconcile/uploadedReconciliation";
import {
  analyzeBatchCompleteness,
  completenessLabel,
  type ReportCompletenessStatus,
} from "@/lib/reports/batchCompleteness";
import { buildProfitPreviewSummary } from "@/lib/reports/buildProfitPreviewSummary";
import type { ProfitPreviewSummary } from "@/lib/reports/buildProfitPreviewSummary";

import { saveUploadBatchAction } from "./actions";
import type {
  SaveUploadBatchResult,
  UploadFileMetadata,
  UploadWorkspaceBatch,
} from "./types";

const etsyCsvGuide = [
  {
    file: "Orders CSV",
    purpose: "Provides gross sales, buyer shipping charged, discounts, order status, and sales tax shown on order rows.",
  },
  {
    file: "Fees / Payment account CSV",
    purpose: "Captures Etsy transaction fees, payment processing fees, listing fees, credits, and other platform expenses.",
  },
  {
    file: "Refunds CSV",
    purpose: "Reduces sales and profit for refunded orders, cases, and related adjustments.",
  },
  {
    file: "Shipping Labels CSV",
    purpose: "Adds Etsy shipping label costs so shipping expenses are not missing from profit.",
  },
  {
    file: "Sales Tax / VAT / GST CSV",
    purpose: "Shows marketplace-collected tax separately so tax does not inflate seller revenue.",
  },
  {
    file: "Deposits CSV",
    purpose: "Helps compare Etsy payment deposits against calculated cash flow and report completeness.",
  },
  {
    file: "Optional COGS CSV",
    purpose: "Adds product cost, packaging cost, and fulfillment cost for Net Profit After COGS.",
  },
];

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function warningLabel(count: number) {
  if (count === 0) return "No warnings";
  if (count === 1) return "1 warning";
  return `${count} warnings`;
}

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith(".csv");
}

function toUploadMetadata(analysis: EtsyCsvUploadAnalysis): UploadFileMetadata {
  return {
    fileName: analysis.fileName,
    fileSizeBytes: analysis.fileSizeBytes,
    fileType: analysis.fileType,
    headers: analysis.headers,
    rows: analysis.rows,
    previewRows: analysis.previewRows,
    rowCount: analysis.rowCount,
    warnings: analysis.warnings,
  };
}

interface UploadCsvClientProps {
  initialWorkspace: UploadWorkspaceBatch | null;
  userEmail: string | null;
}

interface GuestPreview {
  completenessStatus: ReportCompletenessStatus;
  includedFileTypes: string[];
  missingFileTypes: string[];
  summary: ProfitPreviewSummary;
  warningCount: number;
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

function buildLocalWorkspace(analyses: EtsyCsvUploadAnalysis[]): UploadWorkspaceBatch {
  const warningTotal = analyses.reduce(
    (sum, analysis) => sum + analysis.warnings.length,
    0,
  );

  return {
    batchId: "guest-preview",
    fileCount: analyses.length,
    files: analyses.map((analysis) => ({
      fileName: analysis.fileName,
      fileSizeBytes: analysis.fileSizeBytes,
      fileType: analysis.fileType,
      rowCount: analysis.rowCount,
      warningCount: analysis.warnings.length,
    })),
    status: warningTotal > 0 ? "warning" : "parsed",
    warningCount: warningTotal,
  };
}

export function UploadCsvClient({ initialWorkspace, userEmail }: UploadCsvClientProps) {
  const router = useRouter();
  const isSignedIn = Boolean(userEmail);
  const [analyses, setAnalyses] = useState<EtsyCsvUploadAnalysis[]>([]);
  const [workspace, setWorkspace] = useState<UploadWorkspaceBatch | null>(
    initialWorkspace,
  );
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [saveResult, setSaveResult] = useState<SaveUploadBatchResult | null>(null);
  const [previewResult, setPreviewResult] =
    useState<GenerateProfitPreviewResult | null>(null);
  const [guestPreview, setGuestPreview] = useState<GuestPreview | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isGenerating, startGenerateTransition] = useTransition();
  const warningCount = useMemo(
    () => analyses.reduce((sum, analysis) => sum + analysis.warnings.length, 0),
    [analyses],
  );
  const completeness = useMemo(
    () => analyzeBatchCompleteness(workspace?.files.map((file) => file.fileType) ?? []),
    [workspace],
  );

  async function handleFiles(files: FileList | null) {
    setSaveResult(null);
    setPreviewResult(null);
    setGuestPreview(null);

    const selectedFiles = Array.from(files ?? []);
    const nextErrors: string[] = [];

    if (selectedFiles.length === 0) {
      setAnalyses([]);
      setErrorMessages([]);
      return;
    }

    if (selectedFiles.length > MAX_UPLOAD_FILES) {
      nextErrors.push(`Choose at most ${MAX_UPLOAD_FILES} CSV files per upload batch.`);
    }

    for (const file of selectedFiles) {
      if (!isCsvFile(file)) {
        nextErrors.push(
          `${file.name} is not supported. Export your Etsy data as CSV before uploading.`,
        );
      }

      if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
        nextErrors.push(
          `${file.name} is ${formatBytes(file.size)}. Maximum file size is ${formatBytes(
            MAX_UPLOAD_FILE_SIZE_BYTES,
          )}.`,
        );
      }
    }

    if (nextErrors.length > 0) {
      setAnalyses([]);
      setErrorMessages(nextErrors);
      return;
    }

    const nextCsvInputs = await Promise.all(
      selectedFiles.map(async (file) => ({
        fileName: file.name,
        text: await file.text(),
      })),
    );
    const nextAnalyses = nextCsvInputs.map((input, index) =>
      analyzeEtsyCsvUpload({
        fileName: input.fileName,
        fileSizeBytes: selectedFiles[index]?.size ?? 0,
        text: input.text,
      }),
    );

    setAnalyses(nextAnalyses);
    setErrorMessages([]);

    if (!isSignedIn) {
      const localWorkspace = buildLocalWorkspace(nextAnalyses);
      setWorkspace(localWorkspace);
      setSaveResult({
        batchId: localWorkspace.batchId,
        message:
          "CSV files were analyzed in this browser. Log in before downloading the Excel report.",
        status: "success",
        workspace: localWorkspace,
      });
      return;
    }

    startSaveTransition(() => {
      void saveUploadBatchAction({
        files: nextAnalyses.map(toUploadMetadata),
        uploadBatchId: workspace?.batchId,
      }).then((result) => {
        setSaveResult(result);
        if (result.status === "success") {
          setWorkspace(result.workspace);
        }
      });
    });
  }

  function handleGeneratePreview() {
    if (!workspace || workspace.files.length === 0) {
      setPreviewResult({
        message: "Upload at least one Etsy CSV before generating a preview.",
        status: "error",
      });
      return;
    }

    if (!isSignedIn) {
      startGenerateTransition(() => {
        void calculateUploadedReconciliationFromParsedRows(
          analyses.map((analysis) => ({
            fileName: analysis.fileName,
            fileType: analysis.fileType,
            headers: analysis.headers,
            rows: analysis.rows,
          })),
        )
          .then((reconciliation) => {
            const completeness = analyzeBatchCompleteness(
              analyses.map((analysis) => analysis.fileType),
            );
            const summary = buildProfitPreviewSummary(reconciliation.report);
            const warnings = [...summary.warnings, ...completeness.warnings];

            setGuestPreview({
              completenessStatus: completeness.status,
              includedFileTypes: completeness.includedFileTypes,
              missingFileTypes: completeness.missingFileTypes.map(
                (missing) => missing.fileType,
              ),
              summary: {
                ...summary,
                warnings,
              },
              warningCount: warnings.length,
            });
            setPreviewResult({
              message:
                "Temporary Profit Preview generated. Log in before downloading the Excel report.",
              status: "error",
            });
          })
          .catch((error) => {
            setPreviewResult({
              message:
                error instanceof Error
                  ? error.message
                  : "Could not generate a temporary Profit Preview.",
              status: "error",
            });
          });
      });
      return;
    }

    startGenerateTransition(() => {
      void generateProfitPreviewAction({
        uploadBatchId: workspace.batchId,
      }).then((result) => {
        setPreviewResult(result);
        if (result.status === "success") {
          router.push(`/reports/${result.reportId}`);
        }
      });
    });
  }

  function handleStartNewBatch() {
    setAnalyses([]);
    setWorkspace(null);
    setSaveResult(null);
    setPreviewResult(null);
    setGuestPreview(null);
    setErrorMessages([]);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-800">
              Profit Preview
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Upload Etsy CSV files
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {isSignedIn ? (
                <>
                  Signed in as <span className="font-semibold">{userEmail}</span>. Upload
                  one CSV or select multiple official Etsy CSV exports at once.
                  FlowSync AI groups them into one report batch and tells you what is
                  still missing.
                </>
              ) : (
                <>
                  Upload one CSV or select multiple official Etsy CSV exports at once.
                  You can analyze a temporary preview without logging in. Log in only
                  when you want to download the Excel report.
                </>
              )}
            </p>
          </div>
          <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900">
            CSV only. Excel .xlsx/.xls files are not part of this MVP.
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            How to export Etsy CSV files
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Prepare the CSV files that affect your report
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            In Etsy, export official CSV reports for the same tax year or reporting
            period. You can upload one file first and add missing files later; FlowSync AI
            will keep them grouped in the same report batch.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {etsyCsvGuide.map((item) => (
            <div className="rounded-md border border-stone-200 bg-stone-50 p-4" key={item.file}>
              <p className="text-sm font-black text-slate-950">{item.file}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.purpose}</p>
            </div>
          ))}
        </div>
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          FlowSync AI does not connect to your Etsy account. It only reads the CSV files
          you choose to upload.
        </p>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">
              Choose one or more CSV files
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Up to {MAX_UPLOAD_FILES} files, {formatBytes(MAX_UPLOAD_FILE_SIZE_BYTES)}{" "}
              max each. Supported: orders, refunds, fees, ads, offsite ads, shipping
              labels, sales tax, and deposits. Excel workbooks are not accepted yet;
              export from Etsy as CSV first.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              onClick={handleStartNewBatch}
              type="button"
            >
              Start new batch
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800">
              Select CSV files
              <input
                accept=".csv,text/csv"
                className="sr-only"
                multiple
                onChange={(event) => {
                  void handleFiles(event.currentTarget.files);
                  event.currentTarget.value = "";
                }}
                type="file"
              />
            </label>
          </div>
        </div>

        {errorMessages.length > 0 ? (
          <div className="grid gap-2 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            {errorMessages.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        ) : null}

        {saveResult ? (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              saveResult.status === "success"
                ? "border-teal-200 bg-teal-50 text-teal-950"
                : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="font-semibold">{saveResult.message}</p>
            {saveResult.batchId ? (
              <p className="mt-1 text-xs">Report batch: {saveResult.batchId}</p>
            ) : null}
          </div>
        ) : null}

        {isSaving ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Saving upload metadata...
          </p>
        ) : null}

        <div className="grid gap-4 rounded-md border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Report Batch Workspace
              </p>
              <h3 className="mt-2 text-xl font-black text-slate-950">
                {workspace ? completenessLabel(completeness.status) : "No active batch"}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {workspace
                  ? `${workspace.files.length} uploaded file${
                      workspace.files.length === 1 ? "" : "s"
                    } in this batch. Missing files do not block analysis, but the report will be marked accordingly.`
                  : "Add CSV files to create a new report batch."}
              </p>
            </div>
            <button
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={!workspace || workspace.files.length === 0 || isGenerating}
              onClick={handleGeneratePreview}
              type="button"
            >
              {isGenerating ? "Generating..." : "Analyze Preview"}
            </button>
          </div>

          {workspace ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-md border border-stone-200 bg-white p-4">
                <h4 className="text-sm font-black uppercase text-slate-500">
                  Uploaded files
                </h4>
                {workspace.files.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-600">No files uploaded yet.</p>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {workspace.files.map((file) => (
                      <div
                        className="rounded-md border border-stone-200 px-3 py-2 text-sm"
                        key={file.id ?? `${file.fileName}-${file.fileSizeBytes}`}
                      >
                        <p className="font-bold text-slate-950">{file.fileName}</p>
                        <p className="mt-1 text-xs text-slate-600">
                          {file.fileType} / {formatBytes(file.fileSizeBytes)} /{" "}
                          {file.rowCount} rows / {warningLabel(file.warningCount)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-md border border-stone-200 bg-white p-4">
                <h4 className="text-sm font-black uppercase text-slate-500">
                  Missing file checklist
                </h4>
                {completeness.missingFileTypes.length === 0 ? (
                  <p className="mt-3 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-950">
                    Core Etsy CSV set is complete.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {completeness.missingFileTypes.map((missing) => (
                      <div
                        className={`rounded-md border px-3 py-2 text-sm ${
                          missing.required
                            ? "border-amber-200 bg-amber-50 text-amber-950"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                        key={missing.fileType}
                      >
                        <p className="font-bold">{missing.label}</p>
                        <p className="mt-1 text-xs leading-5">{missing.impact}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {analyses.length > 0 ? (
          <div className="flex flex-col gap-3 rounded-md border border-stone-200 bg-stone-50 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Latest upload review
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Review the files you just added. The batch workspace above contains
                all files that will be analyzed together.
              </p>
            </div>
          </div>
        ) : null}

        {guestPreview ? (
          <div className="grid gap-4 rounded-lg border border-teal-200 bg-teal-50 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-900">
                  Temporary Profit Preview
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  {completenessLabel(guestPreview.completenessStatus)} CSV coverage
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                  This preview is generated in your browser from the CSV files you
                  selected. To download the Excel workbook and save report history,
                  log in and upload the CSV files to your account.
                </p>
              </div>
              <a
                className="inline-flex items-center justify-center rounded-md bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                href="/login"
              >
                Log in to download Excel
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Gross Sales", guestPreview.summary.grossSales],
                ["Refunds", guestPreview.summary.refunds],
                ["Etsy Fees", guestPreview.summary.fees],
                ["Ads", guestPreview.summary.ads],
                ["Shipping Labels", guestPreview.summary.shipping],
                ["Sales Tax / VAT / GST", guestPreview.summary.taxCollected],
                ["Net Profit Before COGS", guestPreview.summary.netProfitBeforeCOGS],
                ["Net Profit After COGS", guestPreview.summary.netProfitAfterCOGS],
              ].map(([label, value]) => (
                <div className="rounded-md border border-teal-100 bg-white p-4" key={label}>
                  <p className="text-sm font-semibold text-slate-500">{label}</p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {formatMoney(Number(value), guestPreview.summary.currency)}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-teal-100 bg-white p-4">
                <p className="text-sm font-black uppercase text-slate-500">
                  Included CSV types
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {guestPreview.includedFileTypes.map((fileType) => (
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900" key={fileType}>
                      {fileType}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-amber-200 bg-white p-4">
                <p className="text-sm font-black uppercase text-slate-500">
                  Missing CSV types
                </p>
                {guestPreview.missingFileTypes.length === 0 ? (
                  <p className="mt-3 text-sm font-semibold text-teal-900">
                    Core CSV coverage is complete.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {guestPreview.missingFileTypes.map((fileType) => (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900" key={fileType}>
                        {fileType}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              {guestPreview.warningCount} warning
              {guestPreview.warningCount === 1 ? "" : "s"} detected. This is a
              temporary analysis, not tax, legal, or accounting advice.
            </p>
          </div>
        ) : null}

        {previewResult && !guestPreview ? (
          <div
            className={`rounded-md border px-4 py-3 text-sm ${
              previewResult.status === "success"
                ? "border-teal-200 bg-teal-50 text-teal-950"
                : "border-rose-200 bg-rose-50 text-rose-950"
            }`}
          >
            <p className="font-semibold">{previewResult.message}</p>
            {previewResult.status === "success" ? (
              <p className="mt-1 text-xs">Opening report preview...</p>
            ) : null}
          </div>
        ) : null}
      </section>

      {analyses.length > 0 ? (
        <section className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Files</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{analyses.length}</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Rows</p>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {analyses.reduce((sum, analysis) => sum + analysis.rowCount, 0)}
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Warnings</p>
              <p className="mt-2 text-2xl font-black text-amber-700">{warningCount}</p>
            </div>
          </div>

          {analyses.map((analysis) => (
            <article
              className="grid gap-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
              key={`${analysis.fileName}-${analysis.fileSizeBytes}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase text-slate-500">
                    {analysis.fileName}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    {analysis.fileTypeLabel}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatBytes(analysis.fileSizeBytes)} / {analysis.rowCount} rows /{" "}
                    {analysis.confidence}% confidence
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    analysis.warnings.length > 0
                      ? "bg-amber-50 text-amber-800"
                      : "bg-teal-50 text-teal-800"
                  }`}
                >
                  {warningLabel(analysis.warnings.length)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black uppercase text-slate-500">Fields</h4>
                {analysis.headers.length === 0 ? (
                  <p className="mt-2 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-slate-600">
                    No headers found.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.headers.map((header) => (
                      <span
                        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-slate-700"
                        key={header}
                      >
                        {header}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {analysis.warnings.length > 0 ? (
                <div>
                  <h4 className="text-sm font-black uppercase text-slate-500">Warnings</h4>
                  <div className="mt-2 grid gap-2">
                    {analysis.warnings.map((warning, index) => (
                      <div
                        className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                        key={`${warning.code}-${warning.field ?? "file"}-${index}`}
                      >
                        <strong>{warning.code}</strong>
                        <span className="ml-2">{warning.message}</span>
                        {warning.row ? (
                          <span className="ml-2 text-xs text-amber-800">
                            Row {warning.row}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className="text-sm font-black uppercase text-slate-500">
                  First 5 rows
                </h4>
                {analysis.previewRows.length === 0 ? (
                  <p className="mt-2 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-slate-600">
                    No data rows found.
                  </p>
                ) : (
                  <div className="mt-2 overflow-x-auto rounded-md border border-stone-200">
                    <table className="min-w-full border-collapse text-sm">
                      <thead className="bg-stone-50 text-left text-xs uppercase text-slate-500">
                        <tr>
                          {analysis.headers.map((header) => (
                            <th className="border-b border-stone-200 px-3 py-2" key={header}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.previewRows.map((row, rowIndex) => (
                          <tr className="border-b border-stone-100" key={rowIndex}>
                            {analysis.headers.map((header) => (
                              <td
                                className="max-w-[220px] truncate px-3 py-2 text-slate-700"
                                key={header}
                                title={row[header]}
                              >
                                {row[header] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
