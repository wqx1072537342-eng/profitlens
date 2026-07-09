import type { CsvWarning } from "../etsy-reconcile/types";

export type ReportCompletenessStatus = "complete" | "partial" | "limited";

export interface ExpectedFileType {
  fileType: string;
  label: string;
  impact: string;
  required: boolean;
  satisfiedBy?: readonly string[];
}

export interface BatchCompletenessResult {
  status: ReportCompletenessStatus;
  includedFileTypes: string[];
  missingFileTypes: ExpectedFileType[];
  warnings: CsvWarning[];
}

export const EXPECTED_ETSY_FILE_TYPES: readonly ExpectedFileType[] = [
  {
    fileType: "orders",
    label: "Orders",
    impact: "Gross sales cannot be calculated reliably without orders.",
    required: true,
  },
  {
    fileType: "fees",
    label: "Fees",
    impact: "Etsy platform fees may be missing, so net profit may be too high.",
    required: true,
  },
  {
    fileType: "refunds",
    label: "Refunds",
    impact: "Refunds may be missing, so sales and profit may be too high.",
    required: true,
  },
  {
    fileType: "shippingLabels",
    label: "Shipping Labels",
    impact: "Etsy shipping label costs may be missing from expenses.",
    required: true,
  },
  {
    fileType: "salesTax",
    label: "Sales Tax / VAT / GST",
    impact: "Tax collected may be incomplete. Tax collected is excluded from profit.",
    required: true,
    satisfiedBy: ["salesTax", "taxes"],
  },
  {
    fileType: "deposits",
    label: "Deposits",
    impact: "Cash flow and deposit reconciliation may be incomplete.",
    required: true,
  },
  {
    fileType: "ads",
    label: "Etsy Ads",
    impact: "Ad spend may be missing if the shop used Etsy Ads.",
    required: false,
  },
  {
    fileType: "offsiteAds",
    label: "Offsite Ads",
    impact: "Offsite Ad fees may be missing if the shop had offsite ad sales.",
    required: false,
  },
  {
    fileType: "cogs",
    label: "COGS",
    impact: "Net Profit After COGS will be incomplete without product costs.",
    required: false,
  },
];

function hasExpectedFileType(included: Set<string>, expected: ExpectedFileType) {
  return (expected.satisfiedBy ?? [expected.fileType]).some((fileType) =>
    included.has(fileType),
  );
}

export function analyzeBatchCompleteness(
  fileTypes: readonly string[],
): BatchCompletenessResult {
  const includedFileTypes = Array.from(new Set(fileTypes.filter(Boolean))).sort();
  const included = new Set(includedFileTypes);
  const missingFileTypes = EXPECTED_ETSY_FILE_TYPES.filter(
    (expected) => !hasExpectedFileType(included, expected),
  );
  const missingRequired = missingFileTypes.filter((expected) => expected.required);
  const hasOrders = included.has("orders");
  const hasFees = included.has("fees");
  const status: ReportCompletenessStatus =
    missingRequired.length === 0
      ? "complete"
      : hasOrders && hasFees
        ? "partial"
        : "limited";

  return {
    includedFileTypes,
    missingFileTypes,
    status,
    warnings: missingFileTypes.map((missing) => ({
      code: "MISSING_EXPECTED_FILE",
      field: missing.fileType,
      message: `${missing.label} CSV is missing. ${missing.impact}`,
    })),
  };
}

export function completenessLabel(status: string) {
  if (status === "complete") return "Complete";
  if (status === "partial") return "Partial";
  return "Limited";
}
