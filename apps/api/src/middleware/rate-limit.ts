import { rateLimit } from "@football-intel/rate-limit";
import { logger } from "@football-intel/logger";

export function createRateLimiter(limit: number, window: number) {
  return async (c: any, next: any) => {
    const ip =
      c.req.header("x-forwarded-for") ??
      c.req.header("cf-connecting-ip") ??
      "local";

    const key = `rl:${ip}:${c.req.path}`;

    const allowed = await rateLimit(key, limit, window);

    if (!allowed) {
      logger.warn({ ip, path: c.req.path }, "Rate limit exceeded");
      return c.json({ error: "Too many requests" }, 429);
    }

    await next();
  };
}