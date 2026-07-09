import { describe, expect, it } from "vitest";

import { analyzeBatchCompleteness } from "../src/lib/reports/batchCompleteness";

describe("upload batch workspace completeness", () => {
  it("marks a batch with only orders as limited and lists missing files", () => {
    const result = analyzeBatchCompleteness(["orders"]);

    expect(result.status).toBe("limited");
    expect(result.includedFileTypes).toEqual(["orders"]);
    expect(result.missingFileTypes.map((fileType) => fileType.fileType)).toContain(
      "fees",
    );
    expect(result.warnings.map((warning) => warning.code)).toContain(
      "MISSING_EXPECTED_FILE",
    );
  });

  it("marks a batch with orders and fees but missing other core files as partial", () => {
    const result = analyzeBatchCompleteness(["orders", "fees"]);

    expect(result.status).toBe("partial");
    expect(result.missingFileTypes.map((fileType) => fileType.fileType)).toContain(
      "refunds",
    );
  });

  it("marks a batch with core Etsy files as complete while COGS remains optional", () => {
    const result = analyzeBatchCompleteness([
      "orders",
      "fees",
      "refunds",
      "shippingLabels",
      "salesTax",
      "deposits",
    ]);

    expect(result.status).toBe("complete");
    expect(
      result.missingFileTypes.find((fileType) => fileType.fileType === "cogs")
        ?.required,
    ).toBe(false);
  });

  it("accepts the broader taxes CSV as sales tax coverage", () => {
    const result = analyzeBatchCompleteness([
      "orders",
      "fees",
      "refunds",
      "shippingLabels",
      "taxes",
      "deposits",
    ]);

    expect(result.status).toBe("complete");
    expect(
      result.missingFileTypes.find((fileType) => fileType.fileType === "salesTax"),
    ).toBeUndefined();
  });
});
