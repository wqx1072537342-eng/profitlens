import { normalizeDate } from "./normalizeDate";
import { normalizeMoney, roundMoney } from "./normalizeMoney";
import { parseCsv } from "./parseCsv";
import type {
  AbnormalDetectionOptions,
  AbnormalReport,
  CsvWarning,
  ExpectedSign,
} from "./types";
import { validateCsv } from "./validateCsv";

function signMatches(value: number, expected: ExpectedSign): boolean {
  if (expected === "any" || value === 0) {
    return true;
  }

  return expected === "positive" ? value > 0 : value < 0;
}

export async function detectAbnormal(
  filePath: string,
  options: AbnormalDetectionOptions = {},
): Promise<AbnormalReport> {
  const {
    requiredFields = [],
    dateFields = [],
    moneyFields = [],
    orderIdField = "Order ID",
    currencyField = "Currency",
    expectedCurrency,
    knownFeeTypes,
    feeTypeField = "Fee Type",
    typeField = "Type",
    typeSignRules = {},
    signedMoneyFields = {},
    fxRateField = "FX Rate",
    originalCurrencyField = "Original Currency",
    reportingCurrencyField = "Reporting Currency",
    reportingAmountField = "Reporting Amount",
    depositExpectedField,
    depositActualField,
    depositTolerance = 0.01,
    crossFileOrderAmounts,
    orderAmountField = "Amount",
  } = options;

  const parsed = await parseCsv(filePath);
  const warnings: CsvWarning[] = [
    ...parsed.warnings,
    ...validateCsv(parsed.headers, requiredFields, filePath),
  ];
  const missingFields = warnings
    .filter((warning) => warning.code === "MISSING_REQUIRED_FIELD")
    .map((warning) => warning.field)
    .filter((field): field is string => Boolean(field));

  const orderIdCounts = new Map<string, number>();
  parsed.rows.forEach((row) => {
    const orderId = row[orderIdField]?.trim();
    if (orderId) {
      orderIdCounts.set(orderId, (orderIdCounts.get(orderId) ?? 0) + 1);
    }
  });

  const duplicateOrderIds = [...orderIdCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([orderId]) => orderId);

  duplicateOrderIds.forEach((orderId) => {
    warnings.push({
      code: "DUPLICATE_ORDER_ID",
      message: `Duplicate order ID detected: ${orderId}`,
      filePath,
      field: orderIdField,
      value: orderId,
    });
  });

  const badDateRows: AbnormalReport["badDateRows"] = [];
  const emptyMoneyRows: AbnormalReport["emptyMoneyRows"] = [];
  const currencyMismatches: AbnormalReport["currencyMismatches"] = [];
  const unknownFeeTypes: AbnormalReport["unknownFeeTypes"] = [];
  const wrongSignRows: AbnormalReport["wrongSignRows"] = [];
  const missingCurrencyRows: AbnormalReport["missingCurrencyRows"] = [];
  const missingFxRateRows: AbnormalReport["missingFxRateRows"] = [];
  const depositMismatches: AbnormalReport["depositMismatches"] = [];
  const orderAmountMismatches: AbnormalReport["orderAmountMismatches"] = [];
  const resolvedExpectedCurrency =
    expectedCurrency ??
    parsed.rows.find((row) => row[currencyField]?.trim())?.[currencyField]?.trim();
  const knownFeeTypeSet = knownFeeTypes ? new Set(knownFeeTypes) : null;

  parsed.rows.forEach((row, index) => {
    const rowNumber = index + 2;

    dateFields.forEach((field) => {
      const normalized = normalizeDate(row[field], {
        filePath,
        row: rowNumber,
        field,
      });

      if (normalized.warnings.length > 0) {
        badDateRows.push({
          row: rowNumber,
          field,
          value: row[field] ?? "",
        });
        warnings.push(...normalized.warnings);
      }
    });

    moneyFields.forEach((field) => {
      const normalized = normalizeMoney(row[field], {
        filePath,
        row: rowNumber,
        field,
      });

      if (normalized.warnings.some((warning) => warning.code === "EMPTY_MONEY_VALUE")) {
        emptyMoneyRows.push({ row: rowNumber, field });
      }

      warnings.push(...normalized.warnings);
    });

    if (knownFeeTypeSet) {
      const feeType = row[feeTypeField]?.trim();
      if (feeType && !knownFeeTypeSet.has(feeType)) {
        unknownFeeTypes.push({
          row: rowNumber,
          field: feeTypeField,
          value: feeType,
        });
        warnings.push({
          code: "UNKNOWN_FEE_TYPE",
          message: `Unknown fee type: ${feeType}`,
          filePath,
          row: rowNumber,
          field: feeTypeField,
          value: feeType,
        });
      }
    }

    Object.entries(signedMoneyFields).forEach(([field, expected]) => {
      const normalized = normalizeMoney(row[field], {
        filePath,
        row: rowNumber,
        field,
      });
      warnings.push(...normalized.warnings);

      if (!signMatches(normalized.value, expected)) {
        wrongSignRows.push({
          row: rowNumber,
          field,
          value: normalized.value,
          expected,
        });
        warnings.push({
          code: "WRONG_SIGN_DIRECTION",
          message: `Wrong sign direction for ${field}: expected ${expected}, got ${normalized.value}`,
          filePath,
          row: rowNumber,
          field,
          value: String(normalized.value),
        });
      }
    });

    const transactionType = row[typeField]?.trim();
    const expectedTypeSign = transactionType ? typeSignRules[transactionType] : undefined;
    if (expectedTypeSign) {
      const normalized = normalizeMoney(row[orderAmountField], {
        filePath,
        row: rowNumber,
        field: orderAmountField,
      });
      warnings.push(...normalized.warnings);

      if (!signMatches(normalized.value, expectedTypeSign)) {
        wrongSignRows.push({
          row: rowNumber,
          field: orderAmountField,
          value: normalized.value,
          expected: expectedTypeSign,
        });
        warnings.push({
          code: "WRONG_SIGN_DIRECTION",
          message: `Wrong sign direction for ${transactionType}: expected ${expectedTypeSign}, got ${normalized.value}`,
          filePath,
          row: rowNumber,
          field: orderAmountField,
          value: String(normalized.value),
        });
      }
    }

    const actualCurrency = row[currencyField]?.trim();
    if (!actualCurrency) {
      missingCurrencyRows.push(rowNumber);
      warnings.push({
        code: "MISSING_CURRENCY",
        message: "Currency is missing.",
        filePath,
        row: rowNumber,
        field: currencyField,
      });
    }

    if (
      resolvedExpectedCurrency &&
      actualCurrency &&
      actualCurrency !== resolvedExpectedCurrency
    ) {
      currencyMismatches.push({
        row: rowNumber,
        field: currencyField,
        expected: resolvedExpectedCurrency,
        actual: actualCurrency,
      });
      warnings.push({
        code: "CURRENCY_MISMATCH",
        message: `Currency mismatch: expected ${resolvedExpectedCurrency}, got ${actualCurrency}`,
        filePath,
        row: rowNumber,
        field: currencyField,
        value: actualCurrency,
      });
    }

    const originalCurrency = row[originalCurrencyField]?.trim();
    const reportingCurrency = row[reportingCurrencyField]?.trim();
    const reportingAmount = row[reportingAmountField]?.trim();
    const fxRate = row[fxRateField]?.trim();
    if (
      originalCurrency &&
      reportingCurrency &&
      originalCurrency !== reportingCurrency &&
      !reportingAmount &&
      !fxRate
    ) {
      missingFxRateRows.push(rowNumber);
      warnings.push({
        code: "MISSING_FX_RATE",
        message: "FX rate is missing for a cross-currency row without reporting amount.",
        filePath,
        row: rowNumber,
        field: fxRateField,
      });
    }

    if (depositExpectedField && depositActualField) {
      const expected = normalizeMoney(row[depositExpectedField], {
        filePath,
        row: rowNumber,
        field: depositExpectedField,
      });
      const actual = normalizeMoney(row[depositActualField], {
        filePath,
        row: rowNumber,
        field: depositActualField,
      });
      warnings.push(...expected.warnings, ...actual.warnings);
      const difference = roundMoney(actual.value - expected.value);

      if (Math.abs(difference) > depositTolerance) {
        depositMismatches.push({
          row: rowNumber,
          expected: expected.value,
          actual: actual.value,
          difference,
        });
        warnings.push({
          code: "DEPOSIT_MISMATCH",
          message: `Deposit mismatch: expected ${expected.value}, got ${actual.value}`,
          filePath,
          row: rowNumber,
          field: depositActualField,
          value: String(actual.value),
        });
      }
    }

    if (crossFileOrderAmounts) {
      const orderId = row[orderIdField]?.trim();
      const expected = orderId ? crossFileOrderAmounts[orderId] : undefined;
      if (orderId && expected != null) {
        const actual = normalizeMoney(row[orderAmountField], {
          filePath,
          row: rowNumber,
          field: orderAmountField,
        });
        warnings.push(...actual.warnings);
        const roundedExpected = roundMoney(expected);
        if (roundMoney(actual.value) !== roundedExpected) {
          orderAmountMismatches.push({
            row: rowNumber,
            orderId,
            expected: roundedExpected,
            actual: roundMoney(actual.value),
          });
          warnings.push({
            code: "CROSS_FILE_ORDER_AMOUNT_MISMATCH",
            message: `Order ${orderId} has inconsistent amounts across files.`,
            filePath,
            row: rowNumber,
            field: orderAmountField,
            value: String(actual.value),
          });
        }
      }
    }
  });

  return {
    warnings,
    missingFields,
    duplicateOrderIds,
    badDateRows,
    emptyMoneyRows,
    currencyMismatches,
    unknownFeeTypes,
    wrongSignRows,
    missingCurrencyRows,
    missingFxRateRows,
    depositMismatches,
    orderAmountMismatches,
  };
}
