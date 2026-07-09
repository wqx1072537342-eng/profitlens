import { normalizeDate } from "../etsy-reconcile/normalizeDate";
import { normalizeMoney } from "../etsy-reconcile/normalizeMoney";
import { parseCsvText } from "../etsy-reconcile/parseCsvText";
import { ETSY_REQUIRED_FIELDS } from "../etsy-reconcile/rules/config";
import type { CsvRow, CsvWarning } from "../etsy-reconcile/types";
import { validateCsv } from "../etsy-reconcile/validateCsv";

export const MAX_UPLOAD_FILES = 10;
export const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export type EtsyUploadFileType =
  | "orders"
  | "refunds"
  | "fees"
  | "ads"
  | "offsiteAds"
  | "shippingLabels"
  | "salesTax"
  | "taxes"
  | "deposits"
  | "cogs"
  | "unknown";

export interface EtsyCsvUploadInput {
  fileName: string;
  fileSizeBytes: number;
  text: string;
}

export interface EtsyCsvUploadAnalysis {
  fileName: string;
  fileSizeBytes: number;
  fileType: EtsyUploadFileType;
  fileTypeLabel: string;
  confidence: number;
  headers: string[];
  rows: CsvRow[];
  previewRows: CsvRow[];
  rowCount: number;
  missingFields: string[];
  warnings: CsvWarning[];
}

interface FileTypeRule {
  fileType: EtsyUploadFileType;
  label: string;
  requiredFields: readonly string[];
  fileNameHints: readonly string[];
  dateFields: readonly string[];
  moneyFields: readonly string[];
}

const FILE_TYPE_RULES: readonly FileTypeRule[] = [
  {
    fileType: "orders",
    label: "Orders",
    requiredFields: ETSY_REQUIRED_FIELDS.orders,
    fileNameHints: ["order", "orders", "sales"],
    dateFields: ["Sale Date"],
    moneyFields: ["Item Price", "Shipping", "Discount", "Sales Tax", "Order Total"],
  },
  {
    fileType: "refunds",
    label: "Refunds",
    requiredFields: ETSY_REQUIRED_FIELDS.refunds,
    fileNameHints: ["refund", "refunds"],
    dateFields: ["Date"],
    moneyFields: ["Amount"],
  },
  {
    fileType: "fees",
    label: "Fees",
    requiredFields: ETSY_REQUIRED_FIELDS.fees,
    fileNameHints: ["fee", "fees", "payment"],
    dateFields: ["Date"],
    moneyFields: ["Amount"],
  },
  {
    fileType: "ads",
    label: "Etsy Ads",
    requiredFields: ETSY_REQUIRED_FIELDS.ads,
    fileNameHints: ["ad", "ads", "advertising"],
    dateFields: ["Date"],
    moneyFields: ["Ad Cost"],
  },
  {
    fileType: "offsiteAds",
    label: "Offsite Ads",
    requiredFields: ETSY_REQUIRED_FIELDS.offsiteAds,
    fileNameHints: ["offsite", "offsite_ad", "offsite_ads"],
    dateFields: ["Date"],
    moneyFields: ["Fee"],
  },
  {
    fileType: "shippingLabels",
    label: "Shipping Labels",
    requiredFields: ETSY_REQUIRED_FIELDS.shippingLabels,
    fileNameHints: ["shipping", "shipping_label", "shipping_labels", "labels"],
    dateFields: ["Purchase Date"],
    moneyFields: ["Shipping Cost"],
  },
  {
    fileType: "taxes",
    label: "Taxes / VAT / GST",
    requiredFields: ETSY_REQUIRED_FIELDS.taxes,
    fileNameHints: ["tax", "taxes", "vat", "gst", "marketplace_collected_tax"],
    dateFields: ["Date"],
    moneyFields: ["Amount"],
  },
  {
    fileType: "salesTax",
    label: "Sales Tax",
    requiredFields: ETSY_REQUIRED_FIELDS.salesTax,
    fileNameHints: ["sales_tax", "tax", "taxes"],
    dateFields: ["Date"],
    moneyFields: ["Sales Tax"],
  },
  {
    fileType: "deposits",
    label: "Deposits",
    requiredFields: ETSY_REQUIRED_FIELDS.deposits,
    fileNameHints: ["deposit", "deposits"],
    dateFields: ["Deposit Date"],
    moneyFields: ["Gross Sales", "Refunds", "Fees", "Deposit Amount"],
  },
  {
    fileType: "cogs",
    label: "COGS",
    requiredFields: ETSY_REQUIRED_FIELDS.cogs,
    fileNameHints: ["cogs", "cost", "costs", "product_cost", "product_costs"],
    dateFields: [],
    moneyFields: ["Unit COGS", "Packaging Cost", "External Fulfillment Cost"],
  },
];

const UNKNOWN_LABEL = "Unknown";
const COMMON_FIELDS = new Set(["date", "order id", "currency"]);

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function filenameMatches(fileName: string, hints: readonly string[]) {
  const normalized = fileName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return hints.some((hint) => normalized.includes(hint));
}

function scoreRule(headers: readonly string[], fileName: string, rule: FileTypeRule) {
  const normalizedHeaders = new Set(headers.map(normalizeHeader));
  const matchedFieldNames = rule.requiredFields.filter((field) =>
    normalizedHeaders.has(normalizeHeader(field)),
  );
  const matchedFields = matchedFieldNames.length;
  const matchedDistinctFields = matchedFieldNames.filter(
    (field) => !COMMON_FIELDS.has(normalizeHeader(field)),
  ).length;
  const hasFileNameHint = filenameMatches(fileName, rule.fileNameHints);
  const fieldScore = matchedFields / rule.requiredFields.length;
  const hintScore = hasFileNameHint ? 0.25 : 0;

  return {
    hasFileNameHint,
    matchedDistinctFields,
    matchedFields,
    score: Math.min(1, fieldScore + hintScore),
  };
}

function classifyCsv(headers: readonly string[], fileName: string): {
  rule: FileTypeRule | null;
  confidence: number;
} {
  if (headers.length === 0) {
    return { rule: null, confidence: 0 };
  }

  const scoredRules = FILE_TYPE_RULES.map((rule) => ({
    rule,
    ...scoreRule(headers, fileName, rule),
  })).sort((left, right) => right.score - left.score);
  const best = scoredRules[0];

  if (
    !best ||
    best.matchedFields < 2 ||
    best.score < 0.45 ||
    (best.matchedDistinctFields === 0 && !best.hasFileNameHint)
  ) {
    return { rule: null, confidence: 0 };
  }

  return {
    rule: best.rule,
    confidence: Math.round(best.score * 100),
  };
}

function collectRowWarnings(
  fileName: string,
  rule: FileTypeRule,
  rows: readonly CsvRow[],
): CsvWarning[] {
  const warnings: CsvWarning[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    for (const field of rule.dateFields) {
      warnings.push(
        ...normalizeDate(row[field], { filePath: fileName, row: rowNumber, field })
          .warnings,
      );
    }

    for (const field of rule.moneyFields) {
      warnings.push(
        ...normalizeMoney(row[field], { filePath: fileName, row: rowNumber, field })
          .warnings,
      );
    }

    if (!row.Currency?.trim()) {
      warnings.push({
        code: "MISSING_CURRENCY",
        message: "Currency is missing.",
        filePath: fileName,
        row: rowNumber,
        field: "Currency",
      });
    }
  });

  return warnings;
}

export function fileTypeLabel(fileType: EtsyUploadFileType) {
  return (
    FILE_TYPE_RULES.find((rule) => rule.fileType === fileType)?.label ?? UNKNOWN_LABEL
  );
}

export function analyzeEtsyCsvUpload(
  input: EtsyCsvUploadInput,
): EtsyCsvUploadAnalysis {
  const parsed = parseCsvText(input.text, input.fileName);
  const { rule, confidence } = classifyCsv(parsed.headers, input.fileName);
  const fileType = rule?.fileType ?? "unknown";
  const warnings: CsvWarning[] = [...parsed.warnings];

  if (parsed.headers.length === 0 && parsed.rows.length === 0) {
    warnings.push({
      code: "EMPTY_CSV_FILE",
      message: "CSV file is empty.",
      filePath: input.fileName,
    });
  }

  if (!rule) {
    if (parsed.headers.length > 0 || parsed.rows.length > 0) {
      warnings.push({
        code: "UNKNOWN_TRANSACTION_TYPE",
        message: "CSV file type could not be recognized from its headers.",
        filePath: input.fileName,
      });
    }
  } else {
    warnings.push(
      ...validateCsv(parsed.headers, rule.requiredFields, input.fileName),
      ...collectRowWarnings(input.fileName, rule, parsed.rows),
    );
  }

  const missingFields = warnings
    .filter((warning) => warning.code === "MISSING_REQUIRED_FIELD")
    .map((warning) => warning.field)
    .filter((field): field is string => Boolean(field));

  return {
    fileName: input.fileName,
    fileSizeBytes: input.fileSizeBytes,
    fileType,
    fileTypeLabel: fileTypeLabel(fileType),
    confidence,
    headers: parsed.headers,
    rows: parsed.rows,
    previewRows: parsed.rows.slice(0, 5),
    rowCount: parsed.rows.length,
    missingFields,
    warnings,
  };
}
