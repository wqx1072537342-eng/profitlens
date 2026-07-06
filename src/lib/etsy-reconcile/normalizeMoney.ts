import type { CsvWarning, NormalizedMoney } from "./types";

export interface NormalizeMoneyContext {
  filePath?: string;
  row?: number;
  field?: string;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Converts Etsy-style money strings into numbers.
 * Supported examples: "$12.99", "-$3.50", "$-3.50", "1,234.56".
 * Empty values become 0 with a warning so imports can continue.
 */
export function normalizeMoney(
  rawValue: unknown,
  context: NormalizeMoneyContext = {},
): NormalizedMoney {
  const warnings: CsvWarning[] = [];
  const value = rawValue == null ? "" : String(rawValue).trim();

  if (value === "") {
    warnings.push({
      code: "EMPTY_MONEY_VALUE",
      message: "Empty money value was treated as 0.",
      filePath: context.filePath,
      row: context.row,
      field: context.field,
      value,
    });

    return { value: 0, warnings };
  }

  const isParenthesizedNegative = /^\(.*\)$/.test(value);
  const cleaned = value
    .replace(/[,$\s]/g, "")
    .replace(/^\((.*)\)$/, "-$1")
    .replace(/^\+\$/, "")
    .replace(/^\$?/, "");

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    warnings.push({
      code: "INVALID_MONEY_VALUE",
      message: `Invalid money value was treated as 0: ${value}`,
      filePath: context.filePath,
      row: context.row,
      field: context.field,
      value,
    });

    return { value: 0, warnings };
  }

  return {
    value: roundMoney(isParenthesizedNegative ? -Math.abs(parsed) : parsed),
    warnings,
  };
}

export function normalizeExpenseMoney(
  rawValue: unknown,
  context: NormalizeMoneyContext = {},
): NormalizedMoney {
  const normalized = normalizeMoney(rawValue, context);
  return {
    value: normalized.value > 0 ? -normalized.value : normalized.value,
    warnings: normalized.warnings,
  };
}
