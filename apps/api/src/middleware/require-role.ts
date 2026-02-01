import { createMiddleware } from "hono/factory";
import { User } from "lucia";

export const requireRole = (
  allowedRoles: Array<"ADMIN" | "MODERATOR">
) =>
  createMiddleware<{
    Variables: {
      user: User | null;
    };
  }>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!allowedRoles.includes(user.role as any)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return next();
  });