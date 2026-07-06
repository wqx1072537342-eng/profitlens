import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  calculateCashFlow,
  calculateChargebacks,
  calculateCOGS,
  calculateFeeAdjustments,
  calculateMultiCurrency,
  calculatePaymentAdjustments,
  calculateProfit,
  calculateReconciliationReport,
  calculateTaxes,
  calculateUploadedReconciliation,
  detectAbnormal,
  ETSY_KNOWN_FEE_TYPES,
  normalizeDate,
  normalizeMoney,
  ORDER_REQUIRED_FIELDS,
  parseCsv,
  reconcileDeposits,
  roundMoney,
  validateCsv,
} from "../src/lib/etsy-reconcile";

const fixtureDir = resolve(process.cwd(), "fixtures", "etsy");

const normalCsvFiles = [
  "01_orders.csv",
  "02_refunds.csv",
  "03_fees.csv",
  "04_ads.csv",
  "05_offsite_ads.csv",
  "06_shipping_labels.csv",
  "07_sales_tax.csv",
  "08_deposits.csv",
  "13_reserve.csv",
  "14_chargebacks.csv",
  "15_multi_currency.csv",
  "16_taxes.csv",
  "17_fee_adjustments.csv",
  "18_gift_cards_coupons.csv",
  "19_cogs.csv",
  "20_bank_statement.csv",
];

describe("etsy reconcile fixtures", () => {
  it("can read all normal CSV files", async () => {
    for (const fileName of normalCsvFiles) {
      const parsed = await parseCsv(join(fixtureDir, fileName));

      expect(parsed.headers.length, fileName).toBeGreaterThan(0);
      expect(parsed.rows.length, fileName).toBeGreaterThan(0);
      expect(parsed.warnings, fileName).toEqual([]);
    }
  });

  it("does not crash on missing columns and returns warnings", async () => {
    const parsed = await parseCsv(
      join(fixtureDir, "09_abnormal_missing_columns.csv"),
    );
    const warnings = validateCsv(
      parsed.headers,
      ORDER_REQUIRED_FIELDS,
      parsed.filePath,
    );

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.map((warning) => warning.code)).toContain(
      "MISSING_REQUIRED_FIELD",
    );
  });

  it("detects duplicate order IDs", async () => {
    const report = await detectAbnormal(
      join(fixtureDir, "10_abnormal_duplicate_orders.csv"),
      {
        requiredFields: ORDER_REQUIRED_FIELDS,
        dateFields: ["Sale Date"],
        moneyFields: ["Item Price", "Shipping", "Discount", "Sales Tax", "Order Total"],
        expectedCurrency: "USD",
      },
    );

    expect(report.duplicateOrderIds).toEqual(["E-DUP-001"]);
    expect(report.warnings.map((warning) => warning.code)).toContain(
      "DUPLICATE_ORDER_ID",
    );
  });

  it("normalizes supported date formats", () => {
    const supportedDates = [
      "2026-06-01",
      "2026/06/01",
      "06/01/2026",
      "Jun 1 2026",
      "2026.06.01",
    ];

    for (const value of supportedDates) {
      const normalized = normalizeDate(value);

      expect(normalized.isoDate, value).toBe("2026-06-01");
      expect(normalized.warnings, value).toEqual([]);
    }
  });

  it("does not crash on empty money values", async () => {
    const normalized = normalizeMoney("", { field: "Item Price", row: 2 });
    const report = await detectAbnormal(
      join(fixtureDir, "12_abnormal_empty_values.csv"),
      {
        requiredFields: ORDER_REQUIRED_FIELDS,
        dateFields: ["Sale Date"],
        moneyFields: ["Item Price", "Shipping", "Discount", "Sales Tax", "Order Total"],
        expectedCurrency: "USD",
      },
    );

    expect(normalized.value).toBe(0);
    expect(normalized.warnings.map((warning) => warning.code)).toContain(
      "EMPTY_MONEY_VALUE",
    );
    expect(report.emptyMoneyRows.length).toBeGreaterThan(0);
  });

  it("matches expected_result.json", async () => {
    const expected = JSON.parse(
      await readFile(join(fixtureDir, "expected_result.json"), "utf8"),
    );
    const { result } = await calculateProfit(fixtureDir);

    expect(result).toEqual(expected);
  });

  it("netProfit is 28.75", async () => {
    const { result } = await calculateProfit(fixtureDir);

    expect(result.netProfit).toBe(28.75);
  });

  it("excludes salesTax from netProfit", async () => {
    const { result } = await calculateProfit(fixtureDir);
    const formulaWithoutSalesTax = roundMoney(
      result.grossSales +
        result.refunds +
        result.shippingIncome +
        result.shippingLabelCost +
        result.etsyFees +
        result.etsyAds +
        result.offsiteAds,
    );
    const formulaWithSalesTax = roundMoney(formulaWithoutSalesTax + result.salesTax);

    expect(result.netProfit).toBe(formulaWithoutSalesTax);
    expect(result.netProfit).not.toBe(formulaWithSalesTax);
  });

  it("keeps reserve out of profit but changes expected deposit cash flow", async () => {
    const { result: profit } = await calculateProfit(fixtureDir);
    const { result: cashFlow } = await calculateCashFlow(fixtureDir);

    expect(profit.netProfit).toBe(28.75);
    expect(cashFlow.depositAmount).toBe(37.59);
    expect(cashFlow.reserveHeld).toBe(-20);
    expect(cashFlow.reserveReleased).toBe(5);
    expect(cashFlow.expectedDeposit).toBe(22.59);
    expect(cashFlow.availableForDeposit).toBe(22.59);
  });

  it("applies chargebacks as profit reducers and reversals as profit restorers", async () => {
    const { result: profit } = await calculateProfit(fixtureDir);
    const chargebacks = await calculateChargebacks(fixtureDir);
    const withoutReversal = roundMoney(
      profit.netProfit +
        chargebacks.chargebackPrincipal +
        chargebacks.chargebackFees +
        chargebacks.etsyCaseRefunds,
    );

    expect(chargebacks.chargebackPrincipal).toBe(-25);
    expect(chargebacks.chargebackFees).toBe(-3);
    expect(chargebacks.chargebackReversals).toBe(10);
    expect(chargebacks.etsyCaseRefunds).toBe(-8);
    expect(withoutReversal).toBe(-7.25);
    expect(roundMoney(withoutReversal + chargebacks.chargebackReversals)).toBe(2.75);
    expect(chargebacks.totalProfitImpact).toBe(-26);
  });

  it("normalizes USD/EUR/GBP rows into one reporting currency", async () => {
    const multiCurrency = await calculateMultiCurrency(fixtureDir);

    expect(multiCurrency.reportingCurrency).toBe("USD");
    expect(multiCurrency.totalReportingAmount).toBe(40.95);
    expect(multiCurrency.fxGainLoss).toBe(-0.1);
    expect(multiCurrency.rows.map((row) => row.reportingCurrency)).toEqual([
      "USD",
      "USD",
      "USD",
      "USD",
      "USD",
    ]);
  });

  it("excludes tax collected from profit but includes tax on seller fees", async () => {
    const { result: profit } = await calculateProfit(fixtureDir);
    const { result: taxes } = await calculateTaxes(fixtureDir);
    const profitWithTaxOnFeesOnly = roundMoney(
      profit.netProfit + taxes.taxOnSellerFees,
    );

    expect(taxes.salesTax).toBe(8.84);
    expect(taxes.vat).toBe(5);
    expect(taxes.gst).toBe(3);
    expect(taxes.marketplaceCollectedTax).toBe(12.3);
    expect(taxes.excludedFromProfit).toBe(29.14);
    expect(taxes.taxOnSellerFees).toBe(-1.2);
    expect(profitWithTaxOnFeesOnly).toBe(27.55);
    expect(profitWithTaxOnFeesOnly).not.toBe(
      roundMoney(profit.netProfit + taxes.excludedFromProfit),
    );
  });

  it("treats fee credits as positive profit impact", async () => {
    const { result: profit } = await calculateProfit(fixtureDir);
    const feeAdjustments = await calculateFeeAdjustments(fixtureDir);

    expect(feeAdjustments.transactionFeeCredits).toBe(1.56);
    expect(feeAdjustments.processingFeeCredits).toBe(0.5);
    expect(feeAdjustments.listingFeeCredits).toBe(0.2);
    expect(feeAdjustments.shippingLabelRefunds).toBe(4.82);
    expect(feeAdjustments.regulatoryFeeAdjustments).toBe(-0.3);
    expect(feeAdjustments.totalFeeAdjustmentImpact).toBe(6.78);
    expect(roundMoney(profit.netProfit + feeAdjustments.totalFeeAdjustmentImpact)).toBe(
      35.53,
    );
  });

  it("does not reduce revenue for gift card, Etsy credit, or Etsy-funded coupons", async () => {
    const payments = await calculatePaymentAdjustments(fixtureDir);
    const giftCardOrder = payments.rows.find((row) => row.orderId === "E-GIFT-001");
    const creditCardOrder = payments.rows.find((row) => row.orderId === "E-GIFT-002");
    const sellerDiscountOrder = payments.rows.find(
      (row) => row.orderId === "E-GIFT-003",
    );
    const etsyCouponOrder = payments.rows.find((row) => row.orderId === "E-GIFT-004");

    expect(giftCardOrder?.revenueContribution).toBe(50);
    expect(creditCardOrder?.revenueContribution).toBe(50);
    expect(sellerDiscountOrder?.revenueContribution).toBe(45);
    expect(etsyCouponOrder?.revenueContribution).toBe(50);
    expect(payments.etsyFundedCoupons).toBe(5);
    expect(payments.sellerFundedDiscounts).toBe(-5);
  });

  it("keeps COGS out of Etsy platform reconciliation but deducts operating profit", async () => {
    const { result: profit } = await calculateProfit(fixtureDir);
    const { result: cashFlow } = await calculateCashFlow(fixtureDir);
    const cogs = await calculateCOGS(fixtureDir);

    expect(cashFlow.expectedDeposit).toBe(22.59);
    expect(cogs.productCOGS).toBe(42.5);
    expect(cogs.packagingCost).toBe(4.5);
    expect(cogs.externalFulfillmentCost).toBe(2);
    expect(cogs.totalCOGS).toBe(49);
    expect(roundMoney(profit.netProfit - cogs.totalCOGS)).toBe(-20.25);
  });

  it("matches bank statement deposits within tolerance and warns on mismatch", async () => {
    const matched = await reconcileDeposits(fixtureDir, { tolerance: 0.01 });
    const mismatched = await reconcileDeposits(fixtureDir, {
      bankStatementFileName: "21_bank_statement_mismatch.csv",
      tolerance: 0.01,
    });

    expect(matched.reconciliations).toEqual([
      {
        depositId: "DEP-1001",
        expectedDeposit: 22.59,
        bankAmount: 22.59,
        difference: 0,
        status: "matched",
      },
    ]);
    expect(mismatched.reconciliations[0].status).toBe("warning");
    expect(mismatched.warnings.map((warning) => warning.code)).toContain(
      "DEPOSIT_MISMATCH",
    );
  });

  it("detects extended Etsy abnormalities without crashing", async () => {
    const report = await detectAbnormal(
      join(fixtureDir, "22_abnormal_extended.csv"),
      {
        dateFields: ["Date"],
        moneyFields: ["Amount"],
        knownFeeTypes: ETSY_KNOWN_FEE_TYPES,
        typeSignRules: {
          "Chargeback Fee": "negative",
          reserveHeld: "negative",
        },
        depositExpectedField: "Expected Deposit",
        depositActualField: "Actual Deposit",
        depositTolerance: 0.01,
        crossFileOrderAmounts: {
          "E-AB-001": 100,
        },
      },
    );

    const codes = report.warnings.map((warning) => warning.code);

    expect(report.unknownFeeTypes).toHaveLength(1);
    expect(report.wrongSignRows.length).toBeGreaterThanOrEqual(2);
    expect(report.missingCurrencyRows).toEqual([2]);
    expect(report.missingFxRateRows).toEqual([2, 3]);
    expect(report.depositMismatches).toHaveLength(1);
    expect(report.orderAmountMismatches).toHaveLength(1);
    expect(codes).toContain("UNKNOWN_FEE_TYPE");
    expect(codes).toContain("WRONG_SIGN_DIRECTION");
    expect(codes).toContain("MISSING_CURRENCY");
    expect(codes).toContain("MISSING_FX_RATE");
    expect(codes).toContain("DEPOSIT_MISMATCH");
    expect(codes).toContain("CROSS_FILE_ORDER_AMOUNT_MISMATCH");
  });

  it("builds a richer reconciliation report for downstream SaaS or agent use", async () => {
    const report = await calculateReconciliationReport(fixtureDir);

    expect(report.reportingCurrency).toBe("USD");
    expect(report.profit.netProfitBeforeCOGS).toBe(244.28);
    expect(report.profit.netProfitAfterCOGS).toBe(195.28);
    expect(report.cashFlow.expectedDeposit).toBe(22.59);
    expect(report.depositReconciliations[0].status).toBe("matched");
    expect(report.taxes.excludedFromProfit).toBe(29.14);
  });

  it("classifies uploaded CSV files and calculates report from uploaded rows", async () => {
    const fileNames = [
      "01_orders.csv",
      "02_refunds.csv",
      "03_fees.csv",
      "04_ads.csv",
      "05_offsite_ads.csv",
      "06_shipping_labels.csv",
      "07_sales_tax.csv",
      "08_deposits.csv",
      "13_reserve.csv",
      "14_chargebacks.csv",
      "17_fee_adjustments.csv",
      "19_cogs.csv",
      "20_bank_statement.csv",
    ];
    const result = await calculateUploadedReconciliation(
      await Promise.all(
        fileNames.map(async (fileName) => ({
          fileName,
          text: await readFile(join(fixtureDir, fileName), "utf8"),
        })),
      ),
    );

    expect(result.files.map((file) => file.fileType)).toEqual([
      "orders",
      "refunds",
      "fees",
      "ads",
      "offsiteAds",
      "shippingLabels",
      "salesTax",
      "deposits",
      "reserves",
      "chargebacks",
      "feeAdjustments",
      "cogs",
      "bankStatements",
    ]);
    expect(result.report.profit.grossSales).toBe(141);
    expect(result.report.profit.sellerFundedDiscounts).toBe(-5);
    expect(result.report.profit.netProfitBeforeCOGS).toBe(9.53);
    expect(result.report.profit.netProfitAfterCOGS).toBe(-39.47);
    expect(result.report.cashFlow.expectedDeposit).toBe(22.59);
    expect(result.report.depositReconciliations[0].status).toBe("matched");
  });
});
