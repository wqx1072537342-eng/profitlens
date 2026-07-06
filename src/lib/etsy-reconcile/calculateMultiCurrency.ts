import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import { normalizeMoney, roundMoney } from "./normalizeMoney";
import type { CsvWarning } from "./types";
import { readRowsIfExists } from "./csvRows";
import { MULTI_CURRENCY_REQUIRED_FIELDS } from "./validateCsv";

export interface ConvertedCurrencyRow {
  orderId: string;
  type: string;
  originalAmount: number;
  originalCurrency: string;
  reportingAmount: number;
  reportingCurrency: string;
  fxRate: number | null;
  fxGainLoss: number;
}

export interface MultiCurrencyCalculationResult {
  reportingCurrency: string;
  rows: ConvertedCurrencyRow[];
  totalReportingAmount: number;
  fxGainLoss: number;
  warnings: CsvWarning[];
}

function normalizeFxRate(
  rawValue: string | undefined,
  context: { filePath: string; row: number; field: string },
): { value: number | null; warnings: CsvWarning[] } {
  const value = rawValue?.trim() ?? "";
  if (!value) {
    return { value: null, warnings: [] };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return {
      value: null,
      warnings: [
        {
          code: "INVALID_FX_RATE",
          message: `Invalid FX rate was ignored: ${value}`,
          ...context,
          value,
        },
      ],
    };
  }

  return { value: parsed, warnings: [] };
}

export async function calculateMultiCurrency(
  fixtureDir: string,
): Promise<MultiCurrencyCalculationResult> {
  const filePath = join(fixtureDir, "15_multi_currency.csv");
  const { rows, warnings } = await readRowsIfExists(
    filePath,
    MULTI_CURRENCY_REQUIRED_FIELDS,
  );
  const reportingCurrency =
    rows.find((row) => row["Reporting Currency"]?.trim())?.["Reporting Currency"]?.trim() ??
    "USD";
  const convertedRows: ConvertedCurrencyRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(row.Date, { filePath, row: rowNumber, field: "Date" }).warnings,
    );

    const originalAmount = normalizeMoney(row["Original Amount"], {
      filePath,
      row: rowNumber,
      field: "Original Amount",
    });
    const reportingAmount = normalizeMoney(row["Reporting Amount"], {
      filePath,
      row: rowNumber,
      field: "Reporting Amount",
    });
    const fxRate = normalizeFxRate(row["FX Rate"], {
      filePath,
      row: rowNumber,
      field: "FX Rate",
    });

    warnings.push(...originalAmount.warnings, ...fxRate.warnings);

    const originalCurrency = row["Original Currency"]?.trim() ?? "";
    const rowReportingCurrency =
      row["Reporting Currency"]?.trim() || reportingCurrency;
    const hasReportingAmount = (row["Reporting Amount"] ?? "").trim() !== "";
    const fxRateValue = fxRate.value;
    const hasFxRate = fxRateValue != null;

    let resolvedReportingAmount = 0;
    if (hasReportingAmount) {
      resolvedReportingAmount = reportingAmount.value;
      warnings.push(...reportingAmount.warnings);
    } else if (originalCurrency === rowReportingCurrency) {
      resolvedReportingAmount = originalAmount.value;
    } else if (hasFxRate) {
      resolvedReportingAmount = roundMoney(originalAmount.value * fxRateValue);
    } else {
      warnings.push({
        code: "MISSING_FX_RATE",
        message: "FX rate is required when reporting amount is missing.",
        filePath,
        row: rowNumber,
        field: "FX Rate",
      });
    }

    const convertedByRate = hasFxRate
      ? roundMoney(originalAmount.value * fxRateValue)
      : resolvedReportingAmount;

    convertedRows.push({
      orderId: row["Order ID"] ?? "",
      type: row.Type ?? "",
      originalAmount: originalAmount.value,
      originalCurrency,
      reportingAmount: roundMoney(resolvedReportingAmount),
      reportingCurrency: rowReportingCurrency,
      fxRate: fxRate.value,
      fxGainLoss: roundMoney(resolvedReportingAmount - convertedByRate),
    });
  });

  return {
    reportingCurrency,
    rows: convertedRows,
    totalReportingAmount: roundMoney(
      convertedRows.reduce((sum, row) => sum + row.reportingAmount, 0),
    ),
    fxGainLoss: roundMoney(convertedRows.reduce((sum, row) => sum + row.fxGainLoss, 0)),
    warnings,
  };
}
