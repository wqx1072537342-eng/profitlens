import { calculateCashFlow } from "./calculateCashFlow";
import { calculateChargebacks } from "./calculateChargebacks";
import { calculateCOGS } from "./calculateCogs";
import { calculateFeeAdjustments } from "./calculateFeeAdjustments";
import { calculateMultiCurrency } from "./calculateMultiCurrency";
import { calculatePaymentAdjustments } from "./calculatePaymentAdjustments";
import { calculateProfit } from "./calculateProfit";
import { calculateTaxes } from "./calculateTaxes";
import { reconcileDeposits } from "./reconcileDeposits";
import { roundMoney } from "./normalizeMoney";
import type { ProfitBreakdown, ReconciliationReport } from "./types";

export async function calculateReconciliationReport(
  fixtureDir: string,
): Promise<ReconciliationReport> {
  const baseProfit = await calculateProfit(fixtureDir);
  const cashFlow = await calculateCashFlow(fixtureDir);
  const chargebacks = await calculateChargebacks(fixtureDir);
  const taxes = await calculateTaxes(fixtureDir);
  const feeAdjustments = await calculateFeeAdjustments(fixtureDir);
  const multiCurrency = await calculateMultiCurrency(fixtureDir);
  const paymentAdjustments = await calculatePaymentAdjustments(fixtureDir);
  const cogs = await calculateCOGS(fixtureDir);
  const deposits = await reconcileDeposits(fixtureDir);

  const netProfitBeforeCOGS = roundMoney(
    baseProfit.result.netProfit +
      chargebacks.totalProfitImpact +
      taxes.result.taxOnSellerFees +
      feeAdjustments.totalFeeAdjustmentImpact +
      multiCurrency.totalReportingAmount +
      paymentAdjustments.netRevenueContribution,
  );

  const profit: ProfitBreakdown = {
    currency: baseProfit.result.currency,
    grossSales: roundMoney(baseProfit.result.grossSales + paymentAdjustments.netRevenueContribution),
    shippingIncome: baseProfit.result.shippingIncome,
    refunds: baseProfit.result.refunds,
    sellerFundedDiscounts: paymentAdjustments.sellerFundedDiscounts,
    etsyFees: baseProfit.result.etsyFees,
    feeCredits: feeAdjustments.totalFeeAdjustmentImpact,
    etsyAds: baseProfit.result.etsyAds,
    offsiteAds: baseProfit.result.offsiteAds,
    shippingLabelCost: baseProfit.result.shippingLabelCost,
    shippingLabelRefunds: feeAdjustments.shippingLabelRefunds,
    chargebackPrincipal: chargebacks.chargebackPrincipal,
    chargebackFees: chargebacks.chargebackFees,
    chargebackReversals: chargebacks.chargebackReversals,
    etsyCaseRefunds: chargebacks.etsyCaseRefunds,
    taxOnSellerFees: taxes.result.taxOnSellerFees,
    fxGainLoss: multiCurrency.fxGainLoss,
    netProfitBeforeCOGS,
    productCOGS: cogs.productCOGS,
    packagingCost: cogs.packagingCost,
    externalFulfillmentCost: cogs.externalFulfillmentCost,
    netProfitAfterCOGS: roundMoney(netProfitBeforeCOGS - cogs.totalCOGS),
  };

  return {
    currency: baseProfit.result.currency,
    reportingCurrency: multiCurrency.reportingCurrency,
    profit,
    cashFlow: {
      ...cashFlow.result,
      chargebackCashImpact: chargebacks.totalCashImpact,
      feeAdjustmentCashImpact: feeAdjustments.totalFeeAdjustmentImpact,
    },
    taxes: taxes.result,
    depositReconciliations: deposits.reconciliations,
    warnings: [
      ...baseProfit.warnings,
      ...cashFlow.warnings,
      ...chargebacks.warnings,
      ...taxes.warnings,
      ...feeAdjustments.warnings,
      ...multiCurrency.warnings,
      ...paymentAdjustments.warnings,
      ...cogs.warnings,
      ...deposits.warnings,
    ],
  };
}

