import { Context, Next } from "hono";
import { redis } from "@football-intel/cache";

export const cacheMiddleware = (ttl: number = 60) => {
  return async (c: Context, next: Next) => {
    if (c.req.method !== "GET") {
      return await next();
    }

    const key = `api-cache:${c.req.url}`;
    const cached = await redis.get(key);

    if (cached) {
      c.header("X-Cache", "HIT");
      return c.json(JSON.parse(cached));
    }

    await next();

    if (c.res.status === 200) {
      const data = await c.res.clone().json();
      await redis.set(key, JSON.stringify(data), "EX", ttl);
      c.header("X-Cache", "MISS");
    }
  };
};
