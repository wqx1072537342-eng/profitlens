import { describe, expect, it } from "vitest";

import {
  validateFeedbackSubmission,
  validateWaitlistSubmission,
} from "../src/lib/submissions/validation";

describe("submission validation", () => {
  it("validates waitlist submissions", () => {
    expect(
      validateWaitlistSubmission({
        email: " Seller@Example.com ",
        interest: "Shopify to QuickBooks",
        sourcePage: "/shopify-to-quickbooks",
      }),
    ).toEqual({
      status: "success",
      value: {
        email: "seller@example.com",
        interest: "Shopify to QuickBooks",
        sourcePage: "/shopify-to-quickbooks",
      },
    });

    expect(
      validateWaitlistSubmission({
        email: "not-an-email",
        interest: "Shopify",
        sourcePage: "/shopify",
      }).status,
    ).toBe("error");
  });

  it("validates feedback submissions", () => {
    expect(
      validateFeedbackSubmission({
        email: "",
        message: "The CSV warning was confusing.",
        topic: "CSV file was not recognized",
      }),
    ).toEqual({
      status: "success",
      value: {
        email: null,
        message: "The CSV warning was confusing.",
        topic: "CSV file was not recognized",
      },
    });

    expect(
      validateFeedbackSubmission({
        email: "seller@example.com",
        message: "",
        topic: "Other feedback",
      }).status,
    ).toBe("error");
  });
});
