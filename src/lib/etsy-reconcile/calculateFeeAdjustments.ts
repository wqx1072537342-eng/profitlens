import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import { normalizeMoney, roundMoney } from "./normalizeMoney";
import type { CsvWarning } from "./types";
import { readRowsIfExists } from "./csvRows";
import { FEE_ADJUSTMENT_REQUIRED_FIELDS } from "./validateCsv";

export interface FeeAdjustmentCalculationResult {
  transactionFeeCredits: number;
  processingFeeCredits: number;
  listingFeeCredits: number;
  shippingLabelRefunds: number;
  regulatoryFeeAdjustments: number;
  totalFeeAdjustmentImpact: number;
  warnings: CsvWarning[];
}

export async function calculateFeeAdjustments(
  fixtureDir: string,
): Promise<FeeAdjustmentCalculationResult> {
  const filePath = join(fixtureDir, "17_fee_adjustments.csv");
  const { rows, warnings } = await readRowsIfExists(
    filePath,
    FEE_ADJUSTMENT_REQUIRED_FIELDS,
  );

  let transactionFeeCredits = 0;
  let processingFeeCredits = 0;
  let listingFeeCredits = 0;
  let shippingLabelRefunds = 0;
  let regulatoryFeeAdjustments = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(row.Date, { filePath, row: rowNumber, field: "Date" }).warnings,
    );
    const amount = normalizeMoney(row.Amount, {
      filePath,
      row: rowNumber,
      field: "Amount",
    });
    warnings.push(...amount.warnings);

    if (row["Adjustment Type"] === "Transaction Fee Credit") {
      transactionFeeCredits += amount.value;
    } else if (row["Adjustment Type"] === "Processing Fee Credit") {
      processingFeeCredits += amount.value;
    } else if (row["Adjustment Type"] === "Listing Fee Credit") {
      listingFeeCredits += amount.value;
    } else if (row["Adjustment Type"] === "Shipping Label Refund") {
      shippingLabelRefunds += amount.value;
    } else if (row["Adjustment Type"] === "Regulatory Fee Adjustment") {
      regulatoryFeeAdjustments += amount.value;
    }
  });

  const totalFeeAdjustmentImpact = roundMoney(
    transactionFeeCredits +
      processingFeeCredits +
      listingFeeCredits +
      shippingLabelRefunds +
      regulatoryFeeAdjustments,
  );

  return {
    transactionFeeCredits: roundMoney(transactionFeeCredits),
    processingFeeCredits: roundMoney(processingFeeCredits),
    listingFeeCredits: roundMoney(listingFeeCredits),
    shippingLabelRefunds: roundMoney(shippingLabelRefunds),
    regulatoryFeeAdjustments: roundMoney(regulatoryFeeAdjustments),
    totalFeeAdjustmentImpact,
    warnings,
  };
}

