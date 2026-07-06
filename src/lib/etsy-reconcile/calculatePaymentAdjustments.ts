import { join } from "node:path";

import { normalizeDate } from "./normalizeDate";
import { normalizeMoney, roundMoney } from "./normalizeMoney";
import type { CsvWarning } from "./types";
import { readRowsIfExists } from "./csvRows";
import { PAYMENT_ADJUSTMENT_REQUIRED_FIELDS } from "./validateCsv";

export interface PaymentScenarioRow {
  orderId: string;
  paymentType: string;
  revenueContribution: number;
  sellerFundedDiscount: number;
  etsyFundedCoupon: number;
}

export interface PaymentAdjustmentCalculationResult {
  rows: PaymentScenarioRow[];
  giftCardRevenue: number;
  creditCardRevenue: number;
  etsyCreditRevenue: number;
  sellerFundedDiscounts: number;
  etsyFundedCoupons: number;
  netRevenueContribution: number;
  warnings: CsvWarning[];
}

function parseQuantity(
  rawValue: string | undefined,
  context: { filePath: string; row: number; field: string },
): { value: number; warnings: CsvWarning[] } {
  const value = Number(rawValue ?? "");
  if (!Number.isFinite(value)) {
    return {
      value: 0,
      warnings: [
        {
          code: "INVALID_QUANTITY",
          message: `Invalid quantity was treated as 0: ${rawValue ?? ""}`,
          ...context,
          value: rawValue ?? "",
        },
      ],
    };
  }

  return { value, warnings: [] };
}

export async function calculatePaymentAdjustments(
  fixtureDir: string,
): Promise<PaymentAdjustmentCalculationResult> {
  const filePath = join(fixtureDir, "18_gift_cards_coupons.csv");
  const { rows, warnings } = await readRowsIfExists(
    filePath,
    PAYMENT_ADJUSTMENT_REQUIRED_FIELDS,
  );
  const scenarioRows: PaymentScenarioRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const quantity = parseQuantity(row.Quantity, {
      filePath,
      row: rowNumber,
      field: "Quantity",
    });
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
    const sellerDiscount = normalizeMoney(row["Seller Funded Discount"], {
      filePath,
      row: rowNumber,
      field: "Seller Funded Discount",
    });
    const etsyCoupon = normalizeMoney(row["Etsy Funded Coupon"], {
      filePath,
      row: rowNumber,
      field: "Etsy Funded Coupon",
    });

    warnings.push(
      ...normalizeDate(row["Sale Date"], {
        filePath,
        row: rowNumber,
        field: "Sale Date",
      }).warnings,
      ...quantity.warnings,
      ...itemPrice.warnings,
      ...shipping.warnings,
      ...sellerDiscount.warnings,
      ...etsyCoupon.warnings,
    );

    scenarioRows.push({
      orderId: row["Order ID"] ?? "",
      paymentType: row["Payment Type"] ?? "",
      revenueContribution: roundMoney(
        quantity.value * itemPrice.value + shipping.value - Math.abs(sellerDiscount.value),
      ),
      sellerFundedDiscount: roundMoney(-Math.abs(sellerDiscount.value)),
      etsyFundedCoupon: roundMoney(etsyCoupon.value),
    });
  });

  const byPaymentType = (paymentType: string): number =>
    roundMoney(
      scenarioRows
        .filter((row) => row.paymentType === paymentType)
        .reduce((sum, row) => sum + row.revenueContribution, 0),
    );

  return {
    rows: scenarioRows,
    giftCardRevenue: byPaymentType("Gift Card"),
    creditCardRevenue: byPaymentType("Credit Card"),
    etsyCreditRevenue: byPaymentType("Etsy Credit"),
    sellerFundedDiscounts: roundMoney(
      scenarioRows.reduce((sum, row) => sum + row.sellerFundedDiscount, 0),
    ),
    etsyFundedCoupons: roundMoney(
      scenarioRows.reduce((sum, row) => sum + row.etsyFundedCoupon, 0),
    ),
    netRevenueContribution: roundMoney(
      scenarioRows.reduce((sum, row) => sum + row.revenueContribution, 0),
    ),
    warnings,
  };
}

