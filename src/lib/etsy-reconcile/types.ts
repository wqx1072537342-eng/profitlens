export type CsvRow = Record<string, string>;

export type WarningCode =
  | "MISSING_REQUIRED_FIELD"
  | "EMPTY_MONEY_VALUE"
  | "INVALID_MONEY_VALUE"
  | "INVALID_DATE"
  | "DUPLICATE_ORDER_ID"
  | "CURRENCY_MISMATCH"
  | "INVALID_QUANTITY"
  | "UNKNOWN_FEE_TYPE"
  | "UNKNOWN_TRANSACTION_TYPE"
  | "WRONG_SIGN_DIRECTION"
  | "MISSING_CURRENCY"
  | "MISSING_FX_RATE"
  | "INVALID_FX_RATE"
  | "DEPOSIT_MISMATCH"
  | "CROSS_FILE_ORDER_AMOUNT_MISMATCH"
  | "EMPTY_CSV_FILE"
  | "MISSING_EXPECTED_FILE";

export interface CsvWarning {
  code: WarningCode;
  message: string;
  filePath?: string;
  row?: number;
  field?: string;
  value?: string;
}

export interface ParseCsvResult {
  filePath: string;
  headers: string[];
  rows: CsvRow[];
  warnings: CsvWarning[];
}

export interface NormalizedMoney {
  value: number;
  warnings: CsvWarning[];
}

export interface NormalizedDate {
  isoDate: string | null;
  date: Date | null;
  warnings: CsvWarning[];
}

export interface ProfitResult {
  currency: string;
  grossSales: number;
  refunds: number;
  shippingIncome: number;
  shippingLabelCost: number;
  etsyFees: number;
  etsyAds: number;
  offsiteAds: number;
  salesTax: number;
  netProfit: number;
}

export interface ProfitBreakdown {
  currency: string;
  grossSales: number;
  shippingIncome: number;
  refunds: number;
  sellerFundedDiscounts: number;
  etsyFees: number;
  feeCredits: number;
  etsyAds: number;
  offsiteAds: number;
  shippingLabelCost: number;
  shippingLabelRefunds: number;
  chargebackPrincipal: number;
  chargebackFees: number;
  chargebackReversals: number;
  etsyCaseRefunds: number;
  taxOnSellerFees: number;
  fxGainLoss: number;
  netProfitBeforeCOGS: number;
  productCOGS: number;
  packagingCost: number;
  externalFulfillmentCost: number;
  netProfitAfterCOGS: number;
}

export interface CashFlowBreakdown {
  currency: string;
  depositAmount: number;
  reserveHeld: number;
  reserveReleased: number;
  reserveNet: number;
  chargebackCashImpact: number;
  feeAdjustmentCashImpact: number;
  expectedDeposit: number;
  availableForDeposit: number;
}

export interface TaxBreakdown {
  currency: string;
  salesTax: number;
  vat: number;
  gst: number;
  marketplaceCollectedTax: number;
  taxOnSellerFees: number;
  excludedFromProfit: number;
}

export interface DepositReconciliationItem {
  depositId: string;
  expectedDeposit: number;
  bankAmount: number | null;
  difference: number | null;
  status: "matched" | "warning" | "missing_bank";
}

export interface ReconciliationReport {
  currency: string;
  reportingCurrency: string;
  profit: ProfitBreakdown;
  cashFlow: CashFlowBreakdown;
  taxes: TaxBreakdown;
  depositReconciliations: DepositReconciliationItem[];
  warnings: CsvWarning[];
}

export interface ProfitCalculationResult {
  result: ProfitResult;
  warnings: CsvWarning[];
}

export type ExpectedSign = "positive" | "negative" | "any";

export interface AbnormalDetectionOptions {
  requiredFields?: readonly string[];
  dateFields?: readonly string[];
  moneyFields?: readonly string[];
  orderIdField?: string;
  currencyField?: string;
  expectedCurrency?: string;
  knownFeeTypes?: readonly string[];
  feeTypeField?: string;
  typeField?: string;
  typeSignRules?: Readonly<Record<string, ExpectedSign>>;
  signedMoneyFields?: Readonly<Record<string, ExpectedSign>>;
  fxRateField?: string;
  originalCurrencyField?: string;
  reportingCurrencyField?: string;
  reportingAmountField?: string;
  depositExpectedField?: string;
  depositActualField?: string;
  depositTolerance?: number;
  crossFileOrderAmounts?: Readonly<Record<string, number>>;
  orderAmountField?: string;
}

export interface BadDateRow {
  row: number;
  field: string;
  value: string;
}

export interface EmptyMoneyRow {
  row: number;
  field: string;
}

export interface CurrencyMismatchRow {
  row: number;
  field: string;
  expected: string;
  actual: string;
}

export interface UnknownFeeTypeRow {
  row: number;
  field: string;
  value: string;
}

export interface WrongSignRow {
  row: number;
  field: string;
  value: number;
  expected: ExpectedSign;
}

export interface DepositMismatchRow {
  row: number;
  expected: number;
  actual: number;
  difference: number;
}

export interface OrderAmountMismatchRow {
  row: number;
  orderId: string;
  expected: number;
  actual: number;
}

export interface AbnormalReport {
  warnings: CsvWarning[];
  missingFields: string[];
  duplicateOrderIds: string[];
  badDateRows: BadDateRow[];
  emptyMoneyRows: EmptyMoneyRow[];
  currencyMismatches: CurrencyMismatchRow[];
  unknownFeeTypes: UnknownFeeTypeRow[];
  wrongSignRows: WrongSignRow[];
  missingCurrencyRows: number[];
  missingFxRateRows: number[];
  depositMismatches: DepositMismatchRow[];
  orderAmountMismatches: OrderAmountMismatchRow[];
}
