import { describe, expect, it } from "vitest";

import { DODO_STABLECOIN_METHOD } from "@/lib/dodo";
import { creditPackSchema } from "@/lib/schemas";

describe("Dodo constraints", () => {
  it("uses a typed stablecoin method constant", () => {
    expect(["crypto", "crypto_currency"]).toContain(DODO_STABLECOIN_METHOD);
  });

  it("only accepts hackathon credit pack amounts", () => {
    expect(creditPackSchema.parse({ amountUsd: 10, buyerId: "buy_demo" }).amountUsd).toBe(10);
    expect(() => creditPackSchema.parse({ amountUsd: 1, buyerId: "buy_demo" })).toThrow();
  });
});
