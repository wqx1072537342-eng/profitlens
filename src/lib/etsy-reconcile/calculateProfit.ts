import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import {
  normalizeExpenseMoney,
  normalizeMoney,
  roundMoney,
} from "./normalizeMoney";
import { parseCsv } from "./parseCsv";
import type { CsvRow, CsvWarning, ProfitCalculationResult } from "./types";
import {
  ADS_REQUIRED_FIELDS,
  FEE_REQUIRED_FIELDS,
  OFFSITE_ADS_REQUIRED_FIELDS,
  ORDER_REQUIRED_FIELDS,
  REFUND_REQUIRED_FIELDS,
  SALES_TAX_REQUIRED_FIELDS,
  SHIPPING_LABEL_REQUIRED_FIELDS,
  validateCsv,
} from "./validateCsv";

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

async function readRows(
  filePath: string,
  requiredFields: readonly string[],
): Promise<{ rows: CsvRow[]; warnings: CsvWarning[] }> {
  const parsed = await parseCsv(filePath);
  return {
    rows: parsed.rows,
    warnings: [
      ...parsed.warnings,
      ...validateCsv(parsed.headers, requiredFields, filePath),
    ],
  };
}

function collectCurrencies(rows: CsvRow[]): string[] {
  return rows
    .map((row) => row.Currency?.trim())
    .filter((currency): currency is string => Boolean(currency));
}

function assertOneCurrency(currencies: string[], warnings: CsvWarning[]): string {
  const [expectedCurrency = "USD"] = currencies;
  const uniqueCurrencies = new Set(currencies);

  for (const currency of uniqueCurrencies) {
    if (currency !== expectedCurrency) {
      warnings.push({
        code: "CURRENCY_MISMATCH",
        message: `Currency mismatch: expected ${expectedCurrency}, got ${currency}`,
        field: "Currency",
        value: currency,
      });
    }
  }

  return expectedCurrency;
}

/**
 * Calculates the current Etsy fixture profit model.
 *
 * netProfit =
 * grossSales
 * + refunds
 * + shippingIncome
 * + shippingLabelCost
 * + etsyFees
 * + etsyAds
 * + offsiteAds
 *
 * Sales tax is reported for reconciliation only and is intentionally excluded
 * from netProfit because marketplace-collected tax is not seller profit.
 */
export async function calculateProfit(
  fixtureDir: string,
): Promise<ProfitCalculationResult> {
  const warnings: CsvWarning[] = [];

  const orders = await readRows(join(fixtureDir, "01_orders.csv"), ORDER_REQUIRED_FIELDS);
  const refunds = await readRows(join(fixtureDir, "02_refunds.csv"), REFUND_REQUIRED_FIELDS);
  const fees = await readRows(join(fixtureDir, "03_fees.csv"), FEE_REQUIRED_FIELDS);
  const ads = await readRows(join(fixtureDir, "04_ads.csv"), ADS_REQUIRED_FIELDS);
  const offsiteAds = await readRows(
    join(fixtureDir, "05_offsite_ads.csv"),
    OFFSITE_ADS_REQUIRED_FIELDS,
  );
  const shippingLabels = await readRows(
    join(fixtureDir, "06_shipping_labels.csv"),
    SHIPPING_LABEL_REQUIRED_FIELDS,
  );
  const salesTaxes = await readRows(
    join(fixtureDir, "07_sales_tax.csv"),
    SALES_TAX_REQUIRED_FIELDS,
  );

  warnings.push(
    ...orders.warnings,
    ...refunds.warnings,
    ...fees.warnings,
    ...ads.warnings,
    ...offsiteAds.warnings,
    ...shippingLabels.warnings,
    ...salesTaxes.warnings,
  );

  const currencies = [
    ...collectCurrencies(orders.rows),
    ...collectCurrencies(refunds.rows),
    ...collectCurrencies(fees.rows),
    ...collectCurrencies(ads.rows),
    ...collectCurrencies(offsiteAds.rows),
    ...collectCurrencies(shippingLabels.rows),
    ...collectCurrencies(salesTaxes.rows),
  ];
  const currency = assertOneCurrency(currencies, warnings);

  let grossSales = 0;
  let shippingIncome = 0;

  orders.rows.forEach((row, index) => {
    const filePath = join(fixtureDir, "01_orders.csv");
    const rowNumber = index + 2;
    const quantity = parseQuantity(row, filePath, rowNumber);
    const itemPrice = normalizeMoney(row["Item Price"], {
      filePath,
      row: rowNumber,
      field: "Item Price",
    });
    const shipping = normalizeMoney(row.Shipping, {
      filePath,
      row: rowNumber,
      field: "Shipping",
    });
    const discount = normalizeMoney(row.Discount, {
      filePath,
      row: rowNumber,
      field: "Discount",
    });

    warnings.push(
      ...quantity.warnings,
      ...itemPrice.warnings,
      ...shipping.warnings,
      ...discount.warnings,
    );

    grossSales += quantity.value * itemPrice.value - Math.abs(discount.value);
    shippingIncome += shipping.value;
  });

  const sumExpenseField = (
    rows: CsvRow[],
    fileName: string,
    field: string,
  ): number =>
    rows.reduce((sum, row, index) => {
      const normalized = normalizeExpenseMoney(row[field], {
        filePath: join(fixtureDir, fileName),
        row: index + 2,
        field,
      });
      warnings.push(...normalized.warnings);
      return sum + normalized.value;
    }, 0);

  const sumMoneyField = (
    rows: CsvRow[],
    fileName: string,
    field: string,
  ): number =>
    rows.reduce((sum, row, index) => {
      const normalized = normalizeMoney(row[field], {
        filePath: join(fixtureDir, fileName),
        row: index + 2,
        field,
      });
      warnings.push(...normalized.warnings);
      return sum + normalized.value;
    }, 0);

  const refundsTotal = sumExpenseField(refunds.rows, "02_refunds.csv", "Amount");
  const etsyFees = sumExpenseField(fees.rows, "03_fees.csv", "Amount");
  const etsyAds = sumExpenseField(ads.rows, "04_ads.csv", "Ad Cost");
  const offsiteAdsTotal = sumExpenseField(offsiteAds.rows, "05_offsite_ads.csv", "Fee");
  const shippingLabelCost = sumExpenseField(
    shippingLabels.rows,
    "06_shipping_labels.csv",
    "Shipping Cost",
  );
  const salesTax = sumMoneyField(salesTaxes.rows, "07_sales_tax.csv", "Sales Tax");

  for (const [fileName, rows, field] of [
    ["01_orders.csv", orders.rows, "Sale Date"],
    ["02_refunds.csv", refunds.rows, "Date"],
    ["03_fees.csv", fees.rows, "Date"],
    ["04_ads.csv", ads.rows, "Date"],
    ["05_offsite_ads.csv", offsiteAds.rows, "Date"],
    ["06_shipping_labels.csv", shippingLabels.rows, "Purchase Date"],
    ["07_sales_tax.csv", salesTaxes.rows, "Date"],
  ] as const) {
    rows.forEach((row, index) => {
      warnings.push(
        ...normalizeDate(row[field], {
          filePath: join(fixtureDir, fileName),
          row: index + 2,
          field,
        }).warnings,
      );
    });
  }

  const result = {
    currency,
    grossSales: roundMoney(grossSales),
    refunds: roundMoney(refundsTotal),
    shippingIncome: roundMoney(shippingIncome),
    shippingLabelCost: roundMoney(shippingLabelCost),
    etsyFees: roundMoney(etsyFees),
    etsyAds: roundMoney(etsyAds),
    offsiteAds: roundMoney(offsiteAdsTotal),
    salesTax: roundMoney(salesTax),
    netProfit: roundMoney(
      grossSales +
        refundsTotal +
        shippingIncome +
        shippingLabelCost +
        etsyFees +
        etsyAds +
        offsiteAdsTotal,
    ),
  };

  return { result, warnings };
}
