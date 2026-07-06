import type { CsvWarning } from "./types";
import { ETSY_REQUIRED_FIELDS } from "./rules/config";

export const ORDER_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.orders;
export const REFUND_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.refunds;
export const FEE_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.fees;
export const ADS_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.ads;
export const OFFSITE_ADS_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.offsiteAds;
export const SHIPPING_LABEL_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.shippingLabels;
export const SALES_TAX_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.salesTax;
export const DEPOSIT_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.deposits;
export const RESERVE_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.reserves;
export const CHARGEBACK_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.chargebacks;
export const MULTI_CURRENCY_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.multiCurrency;
export const TAX_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.taxes;
export const FEE_ADJUSTMENT_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.feeAdjustments;
export const PAYMENT_ADJUSTMENT_REQUIRED_FIELDS =
  ETSY_REQUIRED_FIELDS.paymentAdjustments;
export const COGS_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.cogs;
export const BANK_STATEMENT_REQUIRED_FIELDS = ETSY_REQUIRED_FIELDS.bankStatements;

export function validateCsv(
  headers: readonly string[],
  requiredFields: readonly string[],
  filePath?: string,
): CsvWarning[] {
  const headerSet = new Set(headers);

  return requiredFields
    .filter((field) => !headerSet.has(field))
    .map((field) => ({
      code: "MISSING_REQUIRED_FIELD",
      message: `Missing required CSV field: ${field}`,
      filePath,
      field,
    }));
}
