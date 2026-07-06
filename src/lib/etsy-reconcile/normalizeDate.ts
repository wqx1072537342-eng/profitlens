import type { CsvWarning, NormalizedDate } from "./types";

export interface NormalizeDateContext {
  filePath?: string;
  row?: number;
  field?: string;
}

const MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function buildDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Normalizes the date variants seen in Etsy exports and common spreadsheet edits.
 * Supported: YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY, "Jun 1 2026", YYYY.MM.DD.
 */
export function normalizeDate(
  rawValue: unknown,
  context: NormalizeDateContext = {},
): NormalizedDate {
  const value = rawValue == null ? "" : String(rawValue).trim();
  let date: Date | null = null;

  const yearFirstMatch = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (yearFirstMatch) {
    date = buildDate(
      Number(yearFirstMatch[1]),
      Number(yearFirstMatch[2]),
      Number(yearFirstMatch[3]),
    );
  }

  const monthFirstMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!date && monthFirstMatch) {
    date = buildDate(
      Number(monthFirstMatch[3]),
      Number(monthFirstMatch[1]),
      Number(monthFirstMatch[2]),
    );
  }

  const monthNameMatch = value.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (!date && monthNameMatch) {
    const month = MONTHS[monthNameMatch[1].toLowerCase()];
    if (month) {
      date = buildDate(Number(monthNameMatch[3]), month, Number(monthNameMatch[2]));
    }
  }

  if (!date) {
    const warning: CsvWarning = {
      code: "INVALID_DATE",
      message: `Invalid or unsupported date value: ${value}`,
      filePath: context.filePath,
      row: context.row,
      field: context.field,
      value,
    };

    return {
      isoDate: null,
      date: null,
      warnings: [warning],
    };
  }

  return {
    isoDate: toIsoDate(date),
    date,
    warnings: [],
  };
}
