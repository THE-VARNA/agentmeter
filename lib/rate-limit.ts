import { getStore } from "@/lib/demo-data";

export function checkRateLimit(key: string, limit = 60, windowMs = 60_000) {
  const store = getStore();
  const now = Date.now();
  const current = store.rateLimits.get(key);

  if (!current || current.resetAt < now) {
    store.rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}
