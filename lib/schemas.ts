import { z } from "zod";

const localDemoUrl = z.string().regex(/^\/api\/mock\/[a-z0-9-]+$/);
const httpsUrl = z.string().url().refine((value) => value.startsWith("https://"), {
  message: "Only HTTPS upstreams are allowed outside the demo allowlist"
});

export const endpointSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  method: z.enum(["GET", "POST"]).default("GET"),
  upstreamUrl: z.union([httpsUrl, localDemoUrl]),
  priceUsd: z.coerce
    .number()
    .min(0.0001, "x402 micropayments must be at least $0.0001")
    .max(10, "Keep MVP endpoints below $10 per request"),
  description: z.string().min(8).max(180),
  mimeType: z.string().min(3).max(80).default("application/json"),
  active: z.coerce.boolean().default(true)
});

export const creditPackSchema = z.object({
  amountUsd: z.coerce.number().refine((value) => [5, 10, 25].includes(value), {
    message: "Credit pack must be $5, $10, or $25"
  }),
  buyerId: z.string().default("buy_demo")
});

export const usageEventSchema = z.object({
  event_id: z.string().min(6),
  customer_id: z.string().min(3),
  event_name: z.literal("api.call"),
  timestamp: z.string().datetime(),
  metadata: z.object({
    endpoint: z.string(),
    method: z.string(),
    price_usd: z.number(),
    x402_network: z.string(),
    tx_signature: z.string().optional()
  })
});

export const demoRunSchema = z.object({
  endpointSlug: z.string().default("weather-alpha")
});

export const webhookHeadersSchema = z.object({
  id: z.string().optional(),
  signature: z.string().optional(),
  timestamp: z.string().optional()
});

export type EndpointInput = z.infer<typeof endpointSchema>;
export type CreditPackInput = z.infer<typeof creditPackSchema>;
export type UsageEventInput = z.infer<typeof usageEventSchema>;
