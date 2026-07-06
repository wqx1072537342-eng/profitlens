import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import { normalizeExpenseMoney, normalizeMoney, roundMoney } from "./normalizeMoney";
import { ETSY_CHARGEBACK_TYPES } from "./rules/config";
import type { CsvWarning } from "./types";
import { readRowsIfExists } from "./csvRows";
import { CHARGEBACK_REQUIRED_FIELDS } from "./validateCsv";

export interface ChargebackCalculationResult {
  chargebackPrincipal: number;
  chargebackFees: number;
  chargebackReversals: number;
  etsyCaseRefunds: number;
  totalProfitImpact: number;
  totalCashImpact: number;
  warnings: CsvWarning[];
}

export async function calculateChargebacks(
  fixtureDir: string,
): Promise<ChargebackCalculationResult> {
  const filePath = join(fixtureDir, "14_chargebacks.csv");
  const { rows, warnings } = await readRowsIfExists(
    filePath,
    CHARGEBACK_REQUIRED_FIELDS,
  );

  let chargebackPrincipal = 0;
  let chargebackFees = 0;
  let chargebackReversals = 0;
  let etsyCaseRefunds = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(row.Date, { filePath, row: rowNumber, field: "Date" }).warnings,
    );

    if (row.Type === ETSY_CHARGEBACK_TYPES.principal) {
      const amount = normalizeExpenseMoney(row.Amount, {
        filePath,
        row: rowNumber,
        field: "Amount",
      });
      chargebackPrincipal += amount.value;
      warnings.push(...amount.warnings);
      return;
    }

    if (row.Type === ETSY_CHARGEBACK_TYPES.fee) {
      const amount = normalizeExpenseMoney(row.Amount, {
        filePath,
        row: rowNumber,
        field: "Amount",
      });
      chargebackFees += amount.value;
      warnings.push(...amount.warnings);
      return;
    }

    if (row.Type === ETSY_CHARGEBACK_TYPES.caseRefund) {
      const amount = normalizeExpenseMoney(row.Amount, {
        filePath,
        row: rowNumber,
        field: "Amount",
      });
      etsyCaseRefunds += amount.value;
      warnings.push(...amount.warnings);
      return;
    }

    if (row.Type === ETSY_CHARGEBACK_TYPES.reversal) {
      const amount = normalizeMoney(row.Amount, {
        filePath,
        row: rowNumber,
        field: "Amount",
      });
      chargebackReversals += amount.value;
      warnings.push(...amount.warnings);
    }
  });

  const total = roundMoney(
    chargebackPrincipal + chargebackFees + chargebackReversals + etsyCaseRefunds,
  );

  return {
    chargebackPrincipal: roundMoney(chargebackPrincipal),
    chargebackFees: roundMoney(chargebackFees),
    chargebackReversals: roundMoney(chargebackReversals),
    etsyCaseRefunds: roundMoney(etsyCaseRefunds),
    totalProfitImpact: total,
    totalCashImpact: total,
    warnings,
  };
}

