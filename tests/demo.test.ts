import { describe, expect, it } from "vitest";

import { createUsageEvent, getStore, resolveMockUpstream } from "@/lib/demo-data";
import { usageEventSchema } from "@/lib/schemas";

describe("demo flow primitives", () => {
  it("creates a Dodo-compatible usage event", () => {
    const store = getStore();
    const event = createUsageEvent(store.endpoints[0], store.buyers[0], "demo_sig_test");
    const parsed = usageEventSchema.parse(event);

    expect(parsed.event_name).toBe("api.call");
    expect(parsed.customer_id).toBe("cus_demo_agent");
  });

  it("resolves seeded mock upstreams", () => {
    const store = getStore();
    const response = resolveMockUpstream(store.endpoints[0]) as { model: string };

    expect(response.model).toBe("weather-alpha");
  });
});
