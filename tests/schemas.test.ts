import { describe, expect, it } from "vitest";

import { endpointSchema } from "@/lib/schemas";

describe("endpointSchema", () => {
  it("accepts demo-local upstreams", () => {
    const parsed = endpointSchema.parse({
      name: "Weather Alpha",
      slug: "weather-alpha",
      method: "GET",
      upstreamUrl: "/api/mock/weather-alpha",
      priceUsd: 0.001,
      description: "Premium weather signal",
      mimeType: "application/json",
      active: true
    });

    expect(parsed.slug).toBe("weather-alpha");
  });

  it("rejects non-HTTPS external upstreams", () => {
    expect(() =>
      endpointSchema.parse({
        name: "Bad",
        slug: "bad-route",
        method: "GET",
        upstreamUrl: "http://example.com",
        priceUsd: 0.001,
        description: "Insecure upstream",
        mimeType: "application/json",
        active: true
      })
    ).toThrow();
  });
});
