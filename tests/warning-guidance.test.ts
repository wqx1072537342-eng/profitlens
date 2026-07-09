import { describe, expect, it } from "vitest";

import { warningActionSuggestion } from "../src/lib/reports/warningGuidance";

describe("warning action guidance", () => {
  it("guides sellers to add missing shipping labels", () => {
    expect(
      warningActionSuggestion({
        code: "MISSING_EXPECTED_FILE",
        field: "shippingLabels",
      }),
    ).toContain("shipping labels CSV");
  });

  it("guides sellers to add missing tax CSV", () => {
    expect(
      warningActionSuggestion({
        code: "MISSING_EXPECTED_FILE",
        field: "salesTax",
      }),
    ).toContain("sales tax, VAT, or GST CSV");
  });

  it("guides sellers to add deposits for cash flow reconciliation", () => {
    expect(
      warningActionSuggestion({
        code: "MISSING_EXPECTED_FILE",
        field: "deposits",
      }),
    ).toContain("deposits CSV");
  });

  it("guides sellers to add optional COGS when needed", () => {
    expect(
      warningActionSuggestion({
        code: "MISSING_EXPECTED_FILE",
        field: "cogs",
      }),
    ).toContain("optional COGS CSV");
  });

  it("falls back to general review guidance for unknown warnings", () => {
    expect(
      warningActionSuggestion({
        code: "SOMETHING_ELSE",
      }),
    ).toBe("Review this warning before relying on the report for bookkeeping or CPA review.");
  });
});
