import { normalizeDate } from "./normalizeDate";
import { normalizeExpenseMoney, normalizeMoney, roundMoney } from "./normalizeMoney";
import { parseCsvText } from "./parseCsvText";
import {
  DEFAULT_RECONCILIATION_TOLERANCE,
  ETSY_CHARGEBACK_TYPES,
  ETSY_FEE_ADJUSTMENT_TYPES,
  ETSY_REQUIRED_FIELDS,
  ETSY_RESERVE_TYPES,
  ETSY_TAX_TYPES,
} from "./rules/config";
import type {
  CashFlowBreakdown,
  CsvRow,
  CsvWarning,
  DepositReconciliationItem,
  ProfitBreakdown,
  ReconciliationReport,
  TaxBreakdown,
} from "./types";
import { validateCsv } from "./validateCsv";

export type UploadedCsvType =
  | "orders"
  | "refunds"
  | "fees"
  | "ads"
  | "offsiteAds"
  | "shippingLabels"
  | "salesTax"
  | "deposits"
  | "reserves"
  | "chargebacks"
  | "taxes"
  | "feeAdjustments"
  | "cogs"
  | "bankStatements"
  | "unknown";

export interface UploadedCsvInput {
  fileName: string;
  text: string;
}

export interface UploadedParsedCsvInput {
  fileName: string;
  fileType: UploadedCsvType;
  headers: string[];
  rows: CsvRow[];
}

export interface UploadedCsvAnalysis {
  fileName: string;
  fileType: UploadedCsvType;
  confidence: number;
  headers: string[];
  previewRows: CsvRow[];
  rowCount: number;
  missingFields: string[];
  warnings: CsvWarning[];
}

export interface UploadedReconciliationResult {
  report: ReconciliationReport;
  files: UploadedCsvAnalysis[];
  warnings: CsvWarning[];
}

type CsvGroups = Record<UploadedCsvType, CsvRow[]>;

const EMPTY_GROUPS: CsvGroups = {
  orders: [],
  refunds: [],
  fees: [],
  ads: [],
  offsiteAds: [],
  shippingLabels: [],
  salesTax: [],
  deposits: [],
  reserves: [],
  chargebacks: [],
  taxes: [],
  feeAdjustments: [],
  cogs: [],
  bankStatements: [],
  unknown: [],
};

const DATE_FIELDS: Partial<Record<UploadedCsvType, readonly string[]>> = {
  orders: ["Sale Date"],
  refunds: ["Date"],
  fees: ["Date"],
  ads: ["Date"],
  offsiteAds: ["Date"],
  shippingLabels: ["Purchase Date"],
  salesTax: ["Date"],
  deposits: ["Deposit Date"],
  reserves: ["Date", "Release Date"],
  chargebacks: ["Date"],
  taxes: ["Date"],
  feeAdjustments: ["Date"],
  bankStatements: ["Bank Date"],
};

const MONEY_FIELDS: Partial<Record<UploadedCsvType, readonly string[]>> = {
  orders: ["Item Price", "Shipping", "Discount", "Sales Tax", "Order Total"],
  refunds: ["Amount"],
  fees: ["Amount"],
  ads: ["Ad Cost"],
  offsiteAds: ["Fee"],
  shippingLabels: ["Shipping Cost"],
  salesTax: ["Sales Tax"],
  deposits: ["Deposit Amount"],
  reserves: ["Amount"],
  chargebacks: ["Amount"],
  taxes: ["Amount"],
  feeAdjustments: ["Amount"],
  cogs: ["Unit COGS", "Packaging Cost", "External Fulfillment Cost"],
  bankStatements: ["Amount"],
};

function hasAll(headers: Set<string>, fields: readonly string[]): boolean {
  return fields.every((field) => headers.has(field));
}

function hasAnyType(rows: readonly CsvRow[], values: readonly string[]): boolean {
  const allowed = new Set(values);
  return rows.some((row) => allowed.has(row.Type?.trim() ?? ""));
}

export function classifyUploadedCsv(
  headers: readonly string[],
  rows: readonly CsvRow[],
): UploadedCsvType {
  const headerSet = new Set(headers);

  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.orders)) return "orders";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.ads)) return "ads";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.offsiteAds)) return "offsiteAds";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.shippingLabels)) return "shippingLabels";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.salesTax)) return "salesTax";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.deposits)) return "deposits";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.reserves)) return "reserves";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.feeAdjustments)) return "feeAdjustments";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.cogs)) return "cogs";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.bankStatements)) return "bankStatements";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.fees)) return "fees";
  if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.taxes)) {
    if (
      hasAnyType(rows, [
        ETSY_CHARGEBACK_TYPES.principal,
        ETSY_CHARGEBACK_TYPES.fee,
        ETSY_CHARGEBACK_TYPES.reversal,
        ETSY_CHARGEBACK_TYPES.caseRefund,
      ])
    ) {
      return "chargebacks";
    }
    if (
      hasAnyType(rows, [
        ETSY_TAX_TYPES.salesTax,
        ETSY_TAX_TYPES.vat,
        ETSY_TAX_TYPES.gst,
        ETSY_TAX_TYPES.marketplaceCollectedTax,
        ETSY_TAX_TYPES.taxOnSellerFees,
      ])
    ) {
      return "taxes";
    }
    if (hasAll(headerSet, ETSY_REQUIRED_FIELDS.refunds)) return "refunds";
  }

  return "unknown";
}

function requiredFieldsForType(fileType: UploadedCsvType): readonly string[] {
  if (fileType === "unknown") return [];
  return ETSY_REQUIRED_FIELDS[fileType];
}

function confidenceForType(headers: readonly string[], fileType: UploadedCsvType): number {
  const requiredFields = requiredFieldsForType(fileType);
  if (requiredFields.length === 0) return 0;
  const headerSet = new Set(headers);
  const matched = requiredFields.filter((field) => headerSet.has(field)).length;
  return Math.round((matched / requiredFields.length) * 100);
}

function parseQuantity(
  value: string | undefined,
  context: { filePath: string; row: number; field: string },
): { value: number; warnings: CsvWarning[] } {
  const rawValue = value?.trim() ?? "";
  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return {
      value: 0,
      warnings: [
        {
          code: "INVALID_QUANTITY",
          message: `Invalid quantity was treated as 0: ${rawValue}`,
          ...context,
          value: rawValue,
        },
      ],
    };
  }

  return { value: parsed, warnings: [] };
}

function validateRows(
  fileName: string,
  fileType: UploadedCsvType,
  headers: readonly string[],
  rows: readonly CsvRow[],
): CsvWarning[] {
  const warnings: CsvWarning[] = [];
  warnings.push(...validateCsv(headers, requiredFieldsForType(fileType), fileName));

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    for (const field of DATE_FIELDS[fileType] ?? []) {
      warnings.push(
        ...normalizeDate(row[field], { filePath: fileName, row: rowNumber, field })
          .warnings,
      );
    }

    for (const field of MONEY_FIELDS[fileType] ?? []) {
      warnings.push(
        ...normalizeMoney(row[field], { filePath: fileName, row: rowNumber, field })
          .warnings,
      );
    }

    const currencyField = fileType === "bankStatements" ? "Currency" : "Currency";
    if (fileType !== "unknown" && fileType !== "cogs" && !row[currencyField]?.trim()) {
      warnings.push({
        code: "MISSING_CURRENCY",
        message: "Currency is missing.",
        filePath: fileName,
        row: rowNumber,
        field: currencyField,
      });
    }
  }

  if (fileType === "unknown") {
    warnings.push({
      code: "UNKNOWN_TRANSACTION_TYPE",
      message: "CSV file type could not be recognized from its headers.",
      filePath: fileName,
    });
  }

  return warnings;
}

function firstCurrency(groups: CsvGroups): string {
  for (const rows of Object.values(groups)) {
    for (const row of rows) {
      const currency = row.Currency?.trim();
      if (currency) return currency;
    }
  }
  return "USD";
}

function sumMoney(
  rows: readonly CsvRow[],
  filePath: string,
  field: string,
  warnings: CsvWarning[],
): number {
  return rows.reduce((sum, row, index) => {
    const normalized = normalizeMoney(row[field], {
      filePath,
      row: index + 2,
      field,
    });
    warnings.push(...normalized.warnings);
    return sum + normalized.value;
  }, 0);
}

function sumExpense(
  rows: readonly CsvRow[],
  filePath: string,
  field: string,
  warnings: CsvWarning[],
): number {
  return rows.reduce((sum, row, index) => {
    const normalized = normalizeExpenseMoney(row[field], {
      filePath,
      row: index + 2,
      field,
    });
    warnings.push(...normalized.warnings);
    return sum + normalized.value;
  }, 0);
}

function calculateCogsFromUploads(
  orders: readonly CsvRow[],
  cogsRows: readonly CsvRow[],
  warnings: CsvWarning[],
): { productCOGS: number; packagingCost: number; externalFulfillmentCost: number } {
  const cogsByItem = new Map<
    string,
    {
      unitCOGS: number;
      packagingCost: number;
      externalFulfillmentCost: number;
    }
  >();

  cogsRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const unitCOGS = normalizeMoney(row["Unit COGS"], {
      filePath: "cogs upload",
      row: rowNumber,
      field: "Unit COGS",
    });
    const packagingCost = normalizeMoney(row["Packaging Cost"], {
      filePath: "cogs upload",
      row: rowNumber,
      field: "Packaging Cost",
    });
    const externalFulfillmentCost = normalizeMoney(row["External Fulfillment Cost"], {
      filePath: "cogs upload",
      row: rowNumber,
      field: "External Fulfillment Cost",
    });
    warnings.push(
      ...unitCOGS.warnings,
      ...packagingCost.warnings,
      ...externalFulfillmentCost.warnings,
    );

    cogsByItem.set(row["Item Name"], {
      unitCOGS: Math.abs(unitCOGS.value),
      packagingCost: Math.abs(packagingCost.value),
      externalFulfillmentCost: Math.abs(externalFulfillmentCost.value),
    });
  });

  let productCOGS = 0;
  let packagingCost = 0;
  let externalFulfillmentCost = 0;

  orders.forEach((row, index) => {
    const quantity = parseQuantity(row.Quantity, {
      filePath: "orders upload",
      row: index + 2,
      field: "Quantity",
    });
    warnings.push(...quantity.warnings);
    const cost = cogsByItem.get(row["Item Name"]);
    if (!cost) return;
    productCOGS += cost.unitCOGS * quantity.value;
    packagingCost += cost.packagingCost;
    externalFulfillmentCost += cost.externalFulfillmentCost;
  });

  return {
    productCOGS: roundMoney(productCOGS),
    packagingCost: roundMoney(packagingCost),
    externalFulfillmentCost: roundMoney(externalFulfillmentCost),
  };
}

function reconcileUploadedBankDeposits(
  deposits: readonly CsvRow[],
  bankRows: readonly CsvRow[],
  reserveNet: number,
  warnings: CsvWarning[],
): DepositReconciliationItem[] {
  const bankByDepositId = new Map(bankRows.map((row) => [row["Deposit ID"], row]));
  const depositAmount = sumMoney(deposits, "deposits upload", "Deposit Amount", warnings);
  const tolerance = DEFAULT_RECONCILIATION_TOLERANCE;

  return deposits.map((deposit, index) => {
    const amount = normalizeMoney(deposit["Deposit Amount"], {
      filePath: "deposits upload",
      row: index + 2,
      field: "Deposit Amount",
    });
    warnings.push(...amount.warnings);
    const reserveAllocation =
      depositAmount === 0 ? 0 : (amount.value / depositAmount) * reserveNet;
    const expectedDeposit = roundMoney(amount.value + reserveAllocation);
    const bank = bankByDepositId.get(deposit["Deposit ID"]);

    if (!bank) {
      return {
        depositId: deposit["Deposit ID"],
        expectedDeposit,
        bankAmount: null,
        difference: null,
        status: "missing_bank",
      };
    }

    const bankAmount = normalizeMoney(bank.Amount, {
      filePath: "bank upload",
      field: "Amount",
    });
    warnings.push(...bankAmount.warnings);
    const difference = roundMoney(bankAmount.value - expectedDeposit);
    if (Math.abs(difference) > tolerance) {
      warnings.push({
        code: "DEPOSIT_MISMATCH",
        message: `Deposit mismatch for ${deposit["Deposit ID"]}: expected ${expectedDeposit}, got ${bankAmount.value}`,
        filePath: "bank upload",
        field: "Amount",
        value: bank.Amount,
      });
    }

    return {
      depositId: deposit["Deposit ID"],
      expectedDeposit,
      bankAmount: bankAmount.value,
      difference,
      status: Math.abs(difference) <= tolerance ? "matched" : "warning",
    };
  });
}

export async function calculateUploadedReconciliation(
  inputs: readonly UploadedCsvInput[],
): Promise<UploadedReconciliationResult> {
  const groups: CsvGroups = { ...EMPTY_GROUPS };
  const files: UploadedCsvAnalysis[] = [];
  const warnings: CsvWarning[] = [];

  for (const input of inputs) {
    const parsed = parseCsvText(input.text, input.fileName);
    const fileType = classifyUploadedCsv(parsed.headers, parsed.rows);
    const fileWarnings = [
      ...parsed.warnings,
      ...validateRows(input.fileName, fileType, parsed.headers, parsed.rows),
    ];
    if (parsed.headers.length === 0 && parsed.rows.length === 0) {
      fileWarnings.push({
        code: "EMPTY_CSV_FILE",
        message: "CSV file is empty.",
        filePath: input.fileName,
      });
    }
    const missingFields = fileWarnings
      .filter((warning) => warning.code === "MISSING_REQUIRED_FIELD")
      .map((warning) => warning.field)
      .filter((field): field is string => Boolean(field));

    groups[fileType] = [...groups[fileType], ...parsed.rows];
    warnings.push(...fileWarnings);
    files.push({
      fileName: input.fileName,
      fileType,
      confidence: confidenceForType(parsed.headers, fileType),
      headers: parsed.headers,
      previewRows: parsed.rows.slice(0, 5),
      rowCount: parsed.rows.length,
      missingFields,
      warnings: fileWarnings,
    });
  }

  const report = buildReportFromGroups(groups, warnings);

  return {
    report,
    files,
    warnings,
  };
}

function buildReportFromGroups(
  groups: CsvGroups,
  warnings: CsvWarning[],
): ReconciliationReport {
  const currency = firstCurrency(groups);
  let grossSales = 0;
  let shippingIncome = 0;
  let sellerFundedDiscounts = 0;

  groups.orders.forEach((row, index) => {
    const rowNumber = index + 2;
    const quantity = parseQuantity(row.Quantity, {
      filePath: "orders upload",
      row: rowNumber,
      field: "Quantity",
    });
    const itemPrice = normalizeMoney(row["Item Price"], {
      filePath: "orders upload",
      row: rowNumber,
      field: "Item Price",
    });
    const shipping = normalizeMoney(row.Shipping, {
      filePath: "orders upload",
      row: rowNumber,
      field: "Shipping",
    });
    const discount = normalizeMoney(row.Discount, {
      filePath: "orders upload",
      row: rowNumber,
      field: "Discount",
    });
    warnings.push(
      ...quantity.warnings,
      ...itemPrice.warnings,
      ...shipping.warnings,
      ...discount.warnings,
    );
    grossSales += quantity.value * itemPrice.value;
    shippingIncome += shipping.value;
    sellerFundedDiscounts += -Math.abs(discount.value);
  });

  const refunds = sumExpense(groups.refunds, "refunds upload", "Amount", warnings);
  const etsyFees = sumExpense(groups.fees, "fees upload", "Amount", warnings);
  const etsyAds = sumExpense(groups.ads, "ads upload", "Ad Cost", warnings);
  const offsiteAds = sumExpense(groups.offsiteAds, "offsite ads upload", "Fee", warnings);
  const shippingLabelCost = sumExpense(
    groups.shippingLabels,
    "shipping labels upload",
    "Shipping Cost",
    warnings,
  );

  let feeCredits = 0;
  let shippingLabelRefunds = 0;
  groups.feeAdjustments.forEach((row, index) => {
    const amount = normalizeMoney(row.Amount, {
      filePath: "fee adjustments upload",
      row: index + 2,
      field: "Amount",
    });
    warnings.push(...amount.warnings);
    if (row["Adjustment Type"] === ETSY_FEE_ADJUSTMENT_TYPES.shippingLabelRefund) {
      shippingLabelRefunds += amount.value;
    }
    feeCredits += amount.value;
  });

  let reserveHeld = 0;
  let reserveReleased = 0;
  groups.reserves.forEach((row, index) => {
    if (row.Type === ETSY_RESERVE_TYPES.held) {
      reserveHeld += normalizeExpenseMoney(row.Amount, {
        filePath: "reserves upload",
        row: index + 2,
        field: "Amount",
      }).value;
    } else if (row.Type === ETSY_RESERVE_TYPES.released) {
      reserveReleased += normalizeMoney(row.Amount, {
        filePath: "reserves upload",
        row: index + 2,
        field: "Amount",
      }).value;
    }
  });
  const reserveNet = roundMoney(reserveHeld + reserveReleased);

  let chargebackPrincipal = 0;
  let chargebackFees = 0;
  let chargebackReversals = 0;
  let etsyCaseRefunds = 0;
  groups.chargebacks.forEach((row, index) => {
    if (row.Type === ETSY_CHARGEBACK_TYPES.principal) {
      chargebackPrincipal += normalizeExpenseMoney(row.Amount, {
        filePath: "chargebacks upload",
        row: index + 2,
        field: "Amount",
      }).value;
    } else if (row.Type === ETSY_CHARGEBACK_TYPES.fee) {
      chargebackFees += normalizeExpenseMoney(row.Amount, {
        filePath: "chargebacks upload",
        row: index + 2,
        field: "Amount",
      }).value;
    } else if (row.Type === ETSY_CHARGEBACK_TYPES.reversal) {
      chargebackReversals += normalizeMoney(row.Amount, {
        filePath: "chargebacks upload",
        row: index + 2,
        field: "Amount",
      }).value;
    } else if (row.Type === ETSY_CHARGEBACK_TYPES.caseRefund) {
      etsyCaseRefunds += normalizeExpenseMoney(row.Amount, {
        filePath: "chargebacks upload",
        row: index + 2,
        field: "Amount",
      }).value;
    }
  });

  let salesTax =
    groups.salesTax.length > 0
      ? sumMoney(groups.salesTax, "sales tax upload", "Sales Tax", warnings)
      : sumMoney(groups.orders, "orders upload", "Sales Tax", warnings);
  let vat = 0;
  let gst = 0;
  let marketplaceCollectedTax = 0;
  let taxOnSellerFees = 0;
  groups.taxes.forEach((row, index) => {
    if (row.Type === ETSY_TAX_TYPES.taxOnSellerFees) {
      taxOnSellerFees += normalizeExpenseMoney(row.Amount, {
        filePath: "taxes upload",
        row: index + 2,
        field: "Amount",
      }).value;
      return;
    }
    const amount = normalizeMoney(row.Amount, {
      filePath: "taxes upload",
      row: index + 2,
      field: "Amount",
    }).value;
    if (row.Type === ETSY_TAX_TYPES.salesTax) salesTax += amount;
    if (row.Type === ETSY_TAX_TYPES.vat) vat += amount;
    if (row.Type === ETSY_TAX_TYPES.gst) gst += amount;
    if (row.Type === ETSY_TAX_TYPES.marketplaceCollectedTax) {
      marketplaceCollectedTax += amount;
    }
  });

  const cogs = calculateCogsFromUploads(groups.orders, groups.cogs, warnings);
  const totalCOGS =
    cogs.productCOGS + cogs.packagingCost + cogs.externalFulfillmentCost;
  const depositAmount = sumMoney(
    groups.deposits,
    "deposits upload",
    "Deposit Amount",
    warnings,
  );
  const expectedDeposit = roundMoney(depositAmount + reserveNet);

  const netProfitBeforeCOGS = roundMoney(
    grossSales +
      shippingIncome +
      sellerFundedDiscounts +
      refunds +
      etsyFees +
      etsyAds +
      offsiteAds +
      shippingLabelCost +
      feeCredits +
      chargebackPrincipal +
      chargebackFees +
      chargebackReversals +
      etsyCaseRefunds +
      taxOnSellerFees,
  );

  const profit: ProfitBreakdown = {
    currency,
    grossSales: roundMoney(grossSales),
    shippingIncome: roundMoney(shippingIncome),
    refunds: roundMoney(refunds),
    sellerFundedDiscounts: roundMoney(sellerFundedDiscounts),
    etsyFees: roundMoney(etsyFees),
    feeCredits: roundMoney(feeCredits),
    etsyAds: roundMoney(etsyAds),
    offsiteAds: roundMoney(offsiteAds),
    shippingLabelCost: roundMoney(shippingLabelCost),
    shippingLabelRefunds: roundMoney(shippingLabelRefunds),
    chargebackPrincipal: roundMoney(chargebackPrincipal),
    chargebackFees: roundMoney(chargebackFees),
    chargebackReversals: roundMoney(chargebackReversals),
    etsyCaseRefunds: roundMoney(etsyCaseRefunds),
    taxOnSellerFees: roundMoney(taxOnSellerFees),
    fxGainLoss: 0,
    netProfitBeforeCOGS,
    productCOGS: cogs.productCOGS,
    packagingCost: cogs.packagingCost,
    externalFulfillmentCost: cogs.externalFulfillmentCost,
    netProfitAfterCOGS: roundMoney(netProfitBeforeCOGS - totalCOGS),
  };

  const cashFlow: CashFlowBreakdown = {
    currency,
    depositAmount: roundMoney(depositAmount),
    reserveHeld: roundMoney(reserveHeld),
    reserveReleased: roundMoney(reserveReleased),
    reserveNet,
    chargebackCashImpact: roundMoney(
      chargebackPrincipal + chargebackFees + chargebackReversals + etsyCaseRefunds,
    ),
    feeAdjustmentCashImpact: roundMoney(feeCredits),
    expectedDeposit,
    availableForDeposit: expectedDeposit,
  };

  const taxes: TaxBreakdown = {
    currency,
    salesTax: roundMoney(salesTax),
    vat: roundMoney(vat),
    gst: roundMoney(gst),
    marketplaceCollectedTax: roundMoney(marketplaceCollectedTax),
    taxOnSellerFees: roundMoney(taxOnSellerFees),
    excludedFromProfit: roundMoney(salesTax + vat + gst + marketplaceCollectedTax),
  };

  const depositReconciliations = reconcileUploadedBankDeposits(
    groups.deposits,
    groups.bankStatements,
    reserveNet,
    warnings,
  );

  const report: ReconciliationReport = {
    currency,
    reportingCurrency: currency,
    profit,
    cashFlow,
    taxes,
    depositReconciliations,
    warnings,
  };

  return report;
}

export async function calculateUploadedReconciliationFromParsedRows(
  inputs: readonly UploadedParsedCsvInput[],
): Promise<UploadedReconciliationResult> {
  const groups: CsvGroups = { ...EMPTY_GROUPS };
  const files: UploadedCsvAnalysis[] = [];
  const warnings: CsvWarning[] = [];

  for (const input of inputs) {
    const fileWarnings = validateRows(
      input.fileName,
      input.fileType,
      input.headers,
      input.rows,
    );
    if (input.headers.length === 0 && input.rows.length === 0) {
      fileWarnings.push({
        code: "EMPTY_CSV_FILE",
        message: "CSV file is empty.",
        filePath: input.fileName,
      });
    }
    const missingFields = fileWarnings
      .filter((warning) => warning.code === "MISSING_REQUIRED_FIELD")
      .map((warning) => warning.field)
      .filter((field): field is string => Boolean(field));

    groups[input.fileType] = [...groups[input.fileType], ...input.rows];
    warnings.push(...fileWarnings);
    files.push({
      fileName: input.fileName,
      fileType: input.fileType,
      confidence: confidenceForType(input.headers, input.fileType),
      headers: input.headers,
      previewRows: input.rows.slice(0, 5),
      rowCount: input.rows.length,
      missingFields,
      warnings: fileWarnings,
    });
  }

  const report = buildReportFromGroups(groups, warnings);

  return {
    report,
    files,
    warnings,
  };
}
