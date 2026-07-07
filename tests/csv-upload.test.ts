import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { analyzeEtsyCsvUpload } from "../src/lib/csv-upload/analyzeEtsyCsvUpload";

const fixtureDir = resolve(process.cwd(), "fixtures", "etsy");

async function analyzeFixture(fileName: string) {
  const text = await readFile(join(fixtureDir, fileName), "utf8");

  return analyzeEtsyCsvUpload({
    fileName,
    fileSizeBytes: Buffer.byteLength(text),
    text,
  });
}

describe("csv upload foundation", () => {
  it("recognizes Sprint 2 Etsy CSV types without calculating profit", async () => {
    const analyses = await Promise.all(
      [
        "01_orders.csv",
        "02_refunds.csv",
        "03_fees.csv",
        "04_ads.csv",
        "05_offsite_ads.csv",
        "06_shipping_labels.csv",
        "07_sales_tax.csv",
        "08_deposits.csv",
      ].map(analyzeFixture),
    );

    expect(analyses.map((analysis) => analysis.fileType)).toEqual([
      "orders",
      "refunds",
      "fees",
      "ads",
      "offsiteAds",
      "shippingLabels",
      "salesTax",
      "deposits",
    ]);
    expect(analyses.every((analysis) => analysis.previewRows.length <= 5)).toBe(true);
    expect(analyses.every((analysis) => analysis.headers.length > 0)).toBe(true);
  });

  it("returns warnings for unknown and empty CSV files", () => {
    const unknown = analyzeEtsyCsvUpload({
      fileName: "random_export.csv",
      fileSizeBytes: 15,
      text: "Foo,Bar\n1,2",
    });
    const empty = analyzeEtsyCsvUpload({
      fileName: "empty.csv",
      fileSizeBytes: 0,
      text: "",
    });

    expect(unknown.fileType).toBe("unknown");
    expect(unknown.warnings.map((warning) => warning.code)).toContain(
      "UNKNOWN_TRANSACTION_TYPE",
    );
    expect(empty.fileType).toBe("unknown");
    expect(empty.warnings.map((warning) => warning.code)).toContain("EMPTY_CSV_FILE");
  });

  it("returns warnings for missing fields, bad dates, empty money, and missing currency", () => {
    const analysis = analyzeEtsyCsvUpload({
      fileName: "orders_missing_fields.csv",
      fileSizeBytes: 84,
      text: [
        "Sale Date,Order ID,Currency,Item Price",
        "not-a-date,E-WARN-001,,",
      ].join("\n"),
    });
    const codes = analysis.warnings.map((warning) => warning.code);

    expect(analysis.fileType).toBe("orders");
    expect(codes).toContain("MISSING_REQUIRED_FIELD");
    expect(codes).toContain("INVALID_DATE");
    expect(codes).toContain("EMPTY_MONEY_VALUE");
    expect(codes).toContain("MISSING_CURRENCY");
  });
});
