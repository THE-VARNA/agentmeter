import { describe, expect, it } from "vitest";

import { getStore } from "@/lib/demo-data";
import { buildX402Requirement, createDemoPaymentPayload, verifyDemoPaymentHeader } from "@/lib/x402";

describe("x402 helpers", () => {
  it("builds an exact Solana requirement", () => {
    const store = getStore();
    const requirement = buildX402Requirement(store.endpoints[0], store.merchant);

    expect(requirement.x402Version).toBe(2);
    expect(requirement.accepts[0].scheme).toBe("exact");
    expect(requirement.accepts[0].network).toContain("solana:");
  });

  it("verifies deterministic demo payloads", () => {
    const store = getStore();
    const endpoint = store.endpoints[0];
    const payment = createDemoPaymentPayload(endpoint, store.merchant.solanaWallet);
    const result = verifyDemoPaymentHeader(payment.encoded, endpoint, store.merchant.solanaWallet);

    expect(result.valid).toBe(true);
  });
});
