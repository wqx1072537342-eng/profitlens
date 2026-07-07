import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { calculateUploadedReconciliation, roundMoney } from "../src/lib/etsy-reconcile";
import { buildProfitPreviewSummary } from "../src/lib/reports/buildProfitPreviewSummary";

const fixtureDir = resolve(process.cwd(), "fixtures", "etsy");

async function uploadedFixtures(fileNames: readonly string[]) {
  return Promise.all(
    fileNames.map(async (fileName) => ({
      fileName,
      text: await readFile(join(fixtureDir, fileName), "utf8"),
    })),
  );
}

describe("profit preview summary", () => {
  it("maps uploaded Etsy reconciliation into Sprint 3 report metrics", async () => {
    const reconciliation = await calculateUploadedReconciliation(
      await uploadedFixtures([
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
      ]),
    );
    const { profit, taxes } = reconciliation.report;
    const summary = buildProfitPreviewSummary(reconciliation.report);

    expect(summary.currency).toBe("USD");
    expect(summary.grossSales).toBe(
      roundMoney(profit.grossSales + profit.shippingIncome + profit.sellerFundedDiscounts),
    );
    expect(summary.refunds).toBe(
      roundMoney(
        profit.refunds +
          profit.chargebackPrincipal +
          profit.chargebackReversals +
          profit.etsyCaseRefunds,
      ),
    );
    expect(summary.fees).toBe(
      roundMoney(profit.etsyFees + profit.feeCredits + profit.chargebackFees),
    );
    expect(summary.ads).toBe(roundMoney(profit.etsyAds + profit.offsiteAds));
    expect(summary.shipping).toBe(
      roundMoney(profit.shippingLabelCost + profit.shippingLabelRefunds),
    );
    expect(summary.taxCollected).toBe(taxes.excludedFromProfit);
    expect(summary.netProfitBeforeCOGS).toBe(9.53);
    expect(summary.netProfitAfterCOGS).toBe(-39.47);
  });

  it("keeps warnings in the preview instead of throwing on bad CSV input", async () => {
    const reconciliation = await calculateUploadedReconciliation([
      {
        fileName: "empty.csv",
        text: "",
      },
    ]);
    const summary = buildProfitPreviewSummary(reconciliation.report);

    expect(summary.warnings.map((warning) => warning.code)).toContain("EMPTY_CSV_FILE");
    expect(summary.netProfitBeforeCOGS).toBe(0);
    expect(summary.netProfitAfterCOGS).toBe(0);
  });
});
