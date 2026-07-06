import { join } from "node:path";

import { calculateCashFlow } from "./calculateCashFlow";
import { normalizeDate } from "./normalizeDate";
import { normalizeMoney, roundMoney } from "./normalizeMoney";
import { DEFAULT_RECONCILIATION_TOLERANCE } from "./rules/config";
import type { CsvWarning, DepositReconciliationItem } from "./types";
import { readRowsIfExists } from "./csvRows";
import { BANK_STATEMENT_REQUIRED_FIELDS, DEPOSIT_REQUIRED_FIELDS } from "./validateCsv";

export interface ReconcileDepositsOptions {
  bankStatementFileName?: string;
  tolerance?: number;
}

export interface ReconcileDepositsResult {
  reconciliations: DepositReconciliationItem[];
  warnings: CsvWarning[];
}

export async function reconcileDeposits(
  fixtureDir: string,
  options: ReconcileDepositsOptions = {},
): Promise<ReconcileDepositsResult> {
  const tolerance = options.tolerance ?? DEFAULT_RECONCILIATION_TOLERANCE;
  const depositsFile = join(fixtureDir, "08_deposits.csv");
  const bankFile = join(
    fixtureDir,
    options.bankStatementFileName ?? "20_bank_statement.csv",
  );
  const deposits = await readRowsIfExists(depositsFile, DEPOSIT_REQUIRED_FIELDS);
  const bank = await readRowsIfExists(bankFile, BANK_STATEMENT_REQUIRED_FIELDS);
  const cashFlow = await calculateCashFlow(fixtureDir);
  const warnings = [...deposits.warnings, ...bank.warnings, ...cashFlow.warnings];
  const bankByDepositId = new Map(bank.rows.map((row) => [row["Deposit ID"], row]));
  const baseDepositAmount = deposits.rows.reduce((sum, row, index) => {
    const amount = normalizeMoney(row["Deposit Amount"], {
      filePath: depositsFile,
      row: index + 2,
      field: "Deposit Amount",
    });
    warnings.push(...amount.warnings);
    return sum + amount.value;
  }, 0);
  const reconciliations: DepositReconciliationItem[] = [];

  deposits.rows.forEach((deposit, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(deposit["Deposit Date"], {
        filePath: depositsFile,
        row: rowNumber,
        field: "Deposit Date",
      }).warnings,
    );

    const depositAmount = normalizeMoney(deposit["Deposit Amount"], {
      filePath: depositsFile,
      row: rowNumber,
      field: "Deposit Amount",
    });
    warnings.push(...depositAmount.warnings);

    const reserveAllocation =
      baseDepositAmount === 0
        ? 0
        : (depositAmount.value / baseDepositAmount) * cashFlow.result.reserveNet;
    const expectedDeposit = roundMoney(depositAmount.value + reserveAllocation);
    const bankRow = bankByDepositId.get(deposit["Deposit ID"]);

    if (!bankRow) {
      reconciliations.push({
        depositId: deposit["Deposit ID"],
        expectedDeposit,
        bankAmount: null,
        difference: null,
        status: "missing_bank",
      });
      return;
    }

    const bankAmount = normalizeMoney(bankRow.Amount, {
      filePath: bankFile,
      field: "Amount",
    });
    warnings.push(...bankAmount.warnings);
    const difference = roundMoney(bankAmount.value - expectedDeposit);
    const status = Math.abs(difference) <= tolerance ? "matched" : "warning";

    if (status === "warning") {
      warnings.push({
        code: "DEPOSIT_MISMATCH",
        message: `Deposit mismatch for ${deposit["Deposit ID"]}: expected ${expectedDeposit}, got ${bankAmount.value}`,
        filePath: bankFile,
        field: "Amount",
        value: bankRow.Amount,
      });
    }

    reconciliations.push({
      depositId: deposit["Deposit ID"],
      expectedDeposit,
      bankAmount: bankAmount.value,
      difference,
      status,
    });
  });

  return { reconciliations, warnings };
}

