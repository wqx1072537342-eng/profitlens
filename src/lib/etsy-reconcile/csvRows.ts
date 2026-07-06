import { access } from "node:fs/promises";

import { parseCsv } from "./parseCsv";
import type { CsvRow, CsvWarning } from "./types";
import { validateCsv } from "./validateCsv";

export async function readRows(
  filePath: string,
  requiredFields: readonly string[] = [],
): Promise<{ rows: CsvRow[]; warnings: CsvWarning[]; exists: boolean }> {
  const parsed = await parseCsv(filePath);
  return {
    rows: parsed.rows,
    warnings: [
      ...parsed.warnings,
      ...validateCsv(parsed.headers, requiredFields, filePath),
    ],
    exists: true,
  };
}

export async function readRowsIfExists(
  filePath: string,
  requiredFields: readonly string[] = [],
): Promise<{ rows: CsvRow[]; warnings: CsvWarning[]; exists: boolean }> {
  try {
    await access(filePath);
  } catch {
    return { rows: [], warnings: [], exists: false };
  }

  return readRows(filePath, requiredFields);
}

export function collectCurrencies(rows: CsvRow[], field = "Currency"): string[] {
  return rows
    .map((row) => row[field]?.trim())
    .filter((currency): currency is string => Boolean(currency));
}

export function firstCurrency(rows: CsvRow[], fallback = "USD", field = "Currency"): string {
  return rows.find((row) => row[field]?.trim())?.[field]?.trim() ?? fallback;
}

