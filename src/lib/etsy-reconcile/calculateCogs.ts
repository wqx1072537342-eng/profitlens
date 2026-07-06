import { join } from "node:path";

import { normalizeMoney, roundMoney } from "./normalizeMoney";
import type { CsvRow, CsvWarning } from "./types";
import { readRowsIfExists } from "./csvRows";
import { COGS_REQUIRED_FIELDS, ORDER_REQUIRED_FIELDS } from "./validateCsv";

export interface CogsCalculationResult {
  productCOGS: number;
  packagingCost: number;
  externalFulfillmentCost: number;
  totalCOGS: number;
  warnings: CsvWarning[];
}

function parseQuantity(row: CsvRow, filePath: string, rowNumber: number): {
  value: number;
  warnings: CsvWarning[];
} {
  const rawValue = row.Quantity?.trim() ?? "";
  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    return {
      value: 0,
      warnings: [
        {
          code: "INVALID_QUANTITY",
          message: `Invalid quantity was treated as 0: ${rawValue}`,
          filePath,
          row: rowNumber,
          field: "Quantity",
          value: rawValue,
        },
      ],
    };
  }

  return { value, warnings: [] };
}

export async function calculateCOGS(
  fixtureDir: string,
): Promise<CogsCalculationResult> {
  const ordersFile = join(fixtureDir, "01_orders.csv");
  const cogsFile = join(fixtureDir, "19_cogs.csv");
  const orders = await readRowsIfExists(ordersFile, ORDER_REQUIRED_FIELDS);
  const cogs = await readRowsIfExists(cogsFile, COGS_REQUIRED_FIELDS);
  const warnings = [...orders.warnings, ...cogs.warnings];

  const cogsByItem = new Map<
    string,
    {
      unitCOGS: number;
      packagingCost: number;
      externalFulfillmentCost: number;
    }
  >();

  cogs.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const unitCOGS = normalizeMoney(row["Unit COGS"], {
      filePath: cogsFile,
      row: rowNumber,
      field: "Unit COGS",
    });
    const packagingCost = normalizeMoney(row["Packaging Cost"], {
      filePath: cogsFile,
      row: rowNumber,
      field: "Packaging Cost",
    });
    const externalFulfillmentCost = normalizeMoney(row["External Fulfillment Cost"], {
      filePath: cogsFile,
      row: rowNumber,
      field: "External Fulfillment Cost",
    });
    warnings.push(
      ...unitCOGS.warnings,
      ...packagingCost.warnings,
      ...externalFulfillmentCost.warnings,
    );
    cogsByItem.set(row["Item Name"], {
      unitCOGS: Math.abs(unitCOGS.value),
      packagingCost: Math.abs(packagingCost.value),
      externalFulfillmentCost: Math.abs(externalFulfillmentCost.value),
    });
  });

  let productCOGS = 0;
  let packagingCost = 0;
  let externalFulfillmentCost = 0;

  orders.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const quantity = parseQuantity(row, ordersFile, rowNumber);
    warnings.push(...quantity.warnings);

    const itemCost = cogsByItem.get(row["Item Name"]);
    if (!itemCost) {
      return;
    }

    productCOGS += itemCost.unitCOGS * quantity.value;
    packagingCost += itemCost.packagingCost;
    externalFulfillmentCost += itemCost.externalFulfillmentCost;
  });

  const totalCOGS = roundMoney(productCOGS + packagingCost + externalFulfillmentCost);

  return {
    productCOGS: roundMoney(productCOGS),
    packagingCost: roundMoney(packagingCost),
    externalFulfillmentCost: roundMoney(externalFulfillmentCost),
    totalCOGS,
    warnings,
  };
}

