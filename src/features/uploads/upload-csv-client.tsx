"use client";

import { useMemo, useState, useTransition } from "react";

import {
  analyzeEtsyCsvUpload,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES,
  type EtsyCsvUploadAnalysis,
} from "@/lib/csv-upload/analyzeEtsyCsvUpload";

import { saveUploadBatchAction } from "./actions";
import type { SaveUploadBatchResult, UploadFileMetadata } from "./types";

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

function toUploadMetadata(analysis: EtsyCsvUploadAnalysis): UploadFileMetadata {
  return {
    fileName: analysis.fileName,
    fileSizeBytes: analysis.fileSizeBytes,
    fileType: analysis.fileType,
    headers: analysis.headers,
    previewRows: analysis.previewRows,
    rowCount: analysis.rowCount,
    warnings: analysis.warnings,
  };
}

interface UploadCsvClientProps {
  userEmail: string;
}

export function UploadCsvClient({ userEmail }: UploadCsvClientProps) {
  const [analyses, setAnalyses] = useState<EtsyCsvUploadAnalysis[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [saveResult, setSaveResult] = useState<SaveUploadBatchResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const warningCount = useMemo(
    () => analyses.reduce((sum, analysis) => sum + analysis.warnings.length, 0),
    [analyses],
  );

  async function handleFiles(files: FileList | null) {
    setSaveResult(null);

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
      const isCsv =
        file.name.toLowerCase().endsWith(".csv") ||
        file.type === "text/csv" ||
        file.type === "application/vnd.ms-excel";

      if (!isCsv) {
        nextErrors.push(`${file.name} is not a CSV file.`);
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

    const nextAnalyses = await Promise.all(
      selectedFiles.map(async (file) =>
        analyzeEtsyCsvUpload({
          fileName: file.name,
          fileSizeBytes: file.size,
          text: await file.text(),
        }),
      ),
    );

    setAnalyses(nextAnalyses);
    setErrorMessages([]);

    startTransition(() => {
      void saveUploadBatchAction(nextAnalyses.map(toUploadMetadata)).then(setSaveResult);
    });
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-teal-800">
              CSV Upload Foundation
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Upload Etsy CSV files
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Signed in as <span className="font-semibold">{userEmail}</span>. Choose
              official Etsy CSV exports to identify file types, inspect fields, and
              review warnings before profit calculation is added in a later sprint.
            </p>
          </div>
          <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900">
            Metadata only. No Stripe, no Etsy API, no report generation.
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Choose CSV files</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Up to {MAX_UPLOAD_FILES} files, {formatBytes(MAX_UPLOAD_FILE_SIZE_BYTES)}{" "}
              max each. Supported: orders, refunds, fees, ads, offsite ads, shipping
              labels, sales tax, and deposits.
            </p>
          </div>
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
              <p className="mt-1 text-xs">Upload batch: {saveResult.batchId}</p>
            ) : null}
          </div>
        ) : null}

        {isPending ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Saving upload metadata...
          </p>
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
                    {formatBytes(analysis.fileSizeBytes)} · {analysis.rowCount} rows ·{" "}
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
