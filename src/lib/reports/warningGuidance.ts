export interface WarningGuidanceInput {
  code: string;
  field?: string | null;
}

const missingFileGuidance: Record<string, string> = {
  ads: "If you used Etsy Ads, export the Etsy Ads CSV and add it to this batch.",
  cogs: "Add the optional COGS CSV if you want Net Profit After COGS to include product and packaging costs.",
  deposits: "Export the deposits CSV from Etsy payment reports and add it to improve cash flow reconciliation.",
  fees: "Export the Etsy fees or payment account CSV and add it to avoid overstating profit.",
  offsiteAds: "If you had offsite ad sales, export the Offsite Ads CSV and add it to capture those fees.",
  orders: "Export the orders CSV from Etsy and add it before relying on revenue totals.",
  refunds: "Export the refunds CSV from Etsy and add it to avoid overstating sales and profit.",
  salesTax: "Export the sales tax, VAT, or GST CSV from Etsy and add it so marketplace-collected tax is shown separately.",
  shippingLabels: "Go back to Etsy, export the shipping labels CSV, and add it so label costs are included.",
};

export function warningActionSuggestion(warning: WarningGuidanceInput): string {
  if (warning.code === "MISSING_EXPECTED_FILE" && warning.field) {
    return (
      missingFileGuidance[warning.field] ??
      "Return to Etsy, export the missing CSV, and add it to this report batch."
    );
  }

  if (warning.code === "MISSING_REQUIRED_FIELD") {
    return "Check that the uploaded CSV is the official Etsy export and includes the expected columns.";
  }

  if (warning.code === "UNKNOWN_TRANSACTION_TYPE") {
    return "Upload one of the supported Etsy CSV exports, or keep this file out of the report batch.";
  }

  if (warning.code === "MISSING_CURRENCY") {
    return "Review the source row in Etsy or the CSV export and confirm the currency before sending the report to a CPA.";
  }

  return "Review this warning before relying on the report for bookkeeping or CPA review.";
}
