import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import { normalizeExpenseMoney, normalizeMoney, roundMoney } from "./normalizeMoney";
import { ETSY_TAX_TYPES } from "./rules/config";
import type { CsvWarning, TaxBreakdown } from "./types";
import { firstCurrency, readRowsIfExists } from "./csvRows";
import { SALES_TAX_REQUIRED_FIELDS, TAX_REQUIRED_FIELDS } from "./validateCsv";

export async function calculateTaxes(fixtureDir: string): Promise<{
  result: TaxBreakdown;
  warnings: CsvWarning[];
}> {
  const warnings: CsvWarning[] = [];
  const legacySalesTaxFile = join(fixtureDir, "07_sales_tax.csv");
  const taxesFile = join(fixtureDir, "16_taxes.csv");
  const legacySalesTax = await readRowsIfExists(
    legacySalesTaxFile,
    SALES_TAX_REQUIRED_FIELDS,
  );
  const taxes = await readRowsIfExists(taxesFile, TAX_REQUIRED_FIELDS);

  warnings.push(...legacySalesTax.warnings, ...taxes.warnings);

  const currency = firstCurrency([...legacySalesTax.rows, ...taxes.rows]);
  let salesTax = 0;
  let vat = 0;
  let gst = 0;
  let marketplaceCollectedTax = 0;
  let taxOnSellerFees = 0;

  legacySalesTax.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(row.Date, {
        filePath: legacySalesTaxFile,
        row: rowNumber,
        field: "Date",
      }).warnings,
    );
    const amount = normalizeMoney(row["Sales Tax"], {
      filePath: legacySalesTaxFile,
      row: rowNumber,
      field: "Sales Tax",
    });
    salesTax += amount.value;
    warnings.push(...amount.warnings);
  });

  taxes.rows.forEach((row, index) => {
    const rowNumber = index + 2;
    warnings.push(
      ...normalizeDate(row.Date, { filePath: taxesFile, row: rowNumber, field: "Date" })
        .warnings,
    );

    if (row.Type === ETSY_TAX_TYPES.taxOnSellerFees) {
      const amount = normalizeExpenseMoney(row.Amount, {
        filePath: taxesFile,
        row: rowNumber,
        field: "Amount",
      });
      taxOnSellerFees += amount.value;
      warnings.push(...amount.warnings);
      return;
    }

    const amount = normalizeMoney(row.Amount, {
      filePath: taxesFile,
      row: rowNumber,
      field: "Amount",
    });
    warnings.push(...amount.warnings);

    if (row.Type === ETSY_TAX_TYPES.salesTax) {
      salesTax += amount.value;
    } else if (row.Type === ETSY_TAX_TYPES.vat) {
      vat += amount.value;
    } else if (row.Type === ETSY_TAX_TYPES.gst) {
      gst += amount.value;
    } else if (row.Type === ETSY_TAX_TYPES.marketplaceCollectedTax) {
      marketplaceCollectedTax += amount.value;
    }
  });

  const result: TaxBreakdown = {
    currency,
    salesTax: roundMoney(salesTax),
    vat: roundMoney(vat),
    gst: roundMoney(gst),
    marketplaceCollectedTax: roundMoney(marketplaceCollectedTax),
    taxOnSellerFees: roundMoney(taxOnSellerFees),
    excludedFromProfit: roundMoney(salesTax + vat + gst + marketplaceCollectedTax),
  };

  return { result, warnings };
}

