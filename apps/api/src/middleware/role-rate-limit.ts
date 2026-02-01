import { rateLimit } from "@football-intel/rate-limit";
import { ROLE_RATE_LIMITS } from "../config/role-rate-limits";
import { logger } from "@football-intel/logger";
import { createMiddleware } from "hono/factory";
import { User } from "lucia";

export const createRoleRateLimiter = () =>
  createMiddleware<{
    Variables: {
      user: User | null;
    };
  }>(async (c, next) => {
    const user = c.get("user");
    const role = user?.role ?? "PUBLIC";

    const config =
      ROLE_RATE_LIMITS[role as keyof typeof ROLE_RATE_LIMITS] ??
      ROLE_RATE_LIMITS.PUBLIC;

    const identifier =
      user?.id ??
      c.req.header("x-forwarded-for") ??
      "anonymous";

    const key = `rl:${role}:${identifier}:${c.req.path}`;

    const allowed = await rateLimit(
      key,
      config.limit,
      config.window,
    );

    if (!allowed) {
      logger.warn(
        {
          role,
          identifier,
          path: c.req.path,
        },
        "Role rate limit exceeded",
      );

      return c.json(
        {
          error: "Too many requests",
          role,
        },
        429,
      );
    }

    await next();
  });