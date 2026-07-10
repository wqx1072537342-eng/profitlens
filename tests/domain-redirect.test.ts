import { describe, expect, it } from "vitest";

import { canonicalRedirectUrl } from "../src/lib/domain/canonicalRedirect";

describe("canonical domain redirects", () => {
  it("redirects www domain to apex domain and preserves path/search", () => {
    expect(
      canonicalRedirectUrl("https://www.flowsyncdata.com/shopify-to-quickbooks?ref=seo"),
    ).toBe("https://flowsyncdata.com/shopify-to-quickbooks?ref=seo");
  });

  it("redirects old production vercel domain", () => {
    expect(canonicalRedirectUrl("https://profitlens-delta.vercel.app/pricing")).toBe(
      "https://flowsyncdata.com/pricing",
    );
  });

  it("does not redirect preview deployments or canonical domain", () => {
    expect(canonicalRedirectUrl("https://flowsyncdata.com/")).toBeNull();
    expect(
      canonicalRedirectUrl("https://flowsync-ai-git-feature-example.vercel.app/"),
    ).toBeNull();
  });
});
