import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import { normalizeExpenseMoney, normalizeMoney, roundMoney } from "./normalizeMoney";
import { ETSY_RESERVE_TYPES } from "./rules/config";
import type { CashFlowBreakdown, CsvWarning } from "./types";
import { readRowsIfExists } from "./csvRows";
import { RESERVE_REQUIRED_FIELDS } from "./validateCsv";

export interface ReserveCalculationResult {
  reserveHeld: number;
  reserveReleased: number;
  reserveNet: number;
  warnings: CsvWarning[];
}

export async function calculateReserve(
  fixtureDir: string,
): Promise<ReserveCalculationResult> {
  const filePath = join(fixtureDir, "13_reserve.csv");
  const { rows, warnings } = await readRowsIfExists(filePath, RESERVE_REQUIRED_FIELDS);

  let reserveHeld = 0;
  let reserveReleased = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(row.Date, { filePath, row: rowNumber, field: "Date" }).warnings,
      ...normalizeDate(row["Release Date"], {
        filePath,
        row: rowNumber,
        field: "Release Date",
      }).warnings,
    );

    if (row.Type === ETSY_RESERVE_TYPES.held) {
      const amount = normalizeExpenseMoney(row.Amount, {
        filePath,
        row: rowNumber,
        field: "Amount",
      });
      reserveHeld += amount.value;
      warnings.push(...amount.warnings);
      return;
    }

    if (row.Type === ETSY_RESERVE_TYPES.released) {
      const amount = normalizeMoney(row.Amount, {
        filePath,
        row: rowNumber,
        field: "Amount",
      });
      reserveReleased += amount.value;
      warnings.push(...amount.warnings);
    }
  });

  return {
    reserveHeld: roundMoney(reserveHeld),
    reserveReleased: roundMoney(reserveReleased),
    reserveNet: roundMoney(reserveHeld + reserveReleased),
    warnings,
  };
}

export function applyReserveToCashFlow(
  cashFlow: CashFlowBreakdown,
  reserve: ReserveCalculationResult,
): CashFlowBreakdown {
  return {
    ...cashFlow,
    reserveHeld: reserve.reserveHeld,
    reserveReleased: reserve.reserveReleased,
    reserveNet: reserve.reserveNet,
    expectedDeposit: roundMoney(cashFlow.expectedDeposit + reserve.reserveNet),
    availableForDeposit: roundMoney(cashFlow.availableForDeposit + reserve.reserveNet),
  };
}

