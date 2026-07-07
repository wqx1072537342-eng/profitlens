import { roundMoney } from "../etsy-reconcile/normalizeMoney";
import type { CsvWarning, ReconciliationReport } from "../etsy-reconcile/types";

export interface ProfitPreviewSummary {
  currency: string;
  grossSales: number;
  refunds: number;
  fees: number;
  ads: number;
  shipping: number;
  taxCollected: number;
  netProfitBeforeCOGS: number;
  netProfitAfterCOGS: number;
  warnings: CsvWarning[];
}

export function buildProfitPreviewSummary(
  report: ReconciliationReport,
): ProfitPreviewSummary {
  const { profit, taxes } = report;

  return {
    currency: report.reportingCurrency || report.currency || profit.currency,
    grossSales: roundMoney(
      profit.grossSales + profit.shippingIncome + profit.sellerFundedDiscounts,
    ),
    refunds: roundMoney(
      profit.refunds +
        profit.chargebackPrincipal +
        profit.chargebackReversals +
        profit.etsyCaseRefunds,
    ),
    fees: roundMoney(profit.etsyFees + profit.feeCredits + profit.chargebackFees),
    ads: roundMoney(profit.etsyAds + profit.offsiteAds),
    shipping: roundMoney(profit.shippingLabelCost + profit.shippingLabelRefunds),
    taxCollected: roundMoney(taxes.excludedFromProfit),
    netProfitBeforeCOGS: roundMoney(profit.netProfitBeforeCOGS),
    netProfitAfterCOGS: roundMoney(profit.netProfitAfterCOGS),
    warnings: report.warnings,
  };
}
