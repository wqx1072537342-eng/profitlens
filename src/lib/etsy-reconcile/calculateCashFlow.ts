import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import { normalizeMoney, roundMoney } from "./normalizeMoney";
import type { CashFlowBreakdown, CsvWarning } from "./types";
import { firstCurrency, readRowsIfExists } from "./csvRows";
import { calculateReserve } from "./calculateReserve";
import { DEPOSIT_REQUIRED_FIELDS } from "./validateCsv";

export async function calculateCashFlow(fixtureDir: string): Promise<{
  result: CashFlowBreakdown;
  warnings: CsvWarning[];
}> {
  const depositsFile = join(fixtureDir, "08_deposits.csv");
  const deposits = await readRowsIfExists(depositsFile, DEPOSIT_REQUIRED_FIELDS);
  const reserve = await calculateReserve(fixtureDir);
  const warnings = [...deposits.warnings, ...reserve.warnings];

  let depositAmount = 0;
  deposits.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(row["Deposit Date"], {
        filePath: depositsFile,
        row: rowNumber,
        field: "Deposit Date",
      }).warnings,
    );
    const amount = normalizeMoney(row["Deposit Amount"], {
      filePath: depositsFile,
      row: rowNumber,
      field: "Deposit Amount",
    });
    depositAmount += amount.value;
    warnings.push(...amount.warnings);
  });

  const expectedDeposit = roundMoney(depositAmount + reserve.reserveNet);

  return {
    result: {
      currency: firstCurrency(deposits.rows),
      depositAmount: roundMoney(depositAmount),
      reserveHeld: reserve.reserveHeld,
      reserveReleased: reserve.reserveReleased,
      reserveNet: reserve.reserveNet,
      chargebackCashImpact: 0,
      feeAdjustmentCashImpact: 0,
      expectedDeposit,
      availableForDeposit: expectedDeposit,
    },
    warnings,
  };
}

