import { createMiddleware } from "hono/factory";
import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { User } from "lucia";

export const enforceMatchUnlocked = () =>
  createMiddleware<{
    Variables: {
      user: User | null;
    };
  }>(async (c, next) => {
    const matchId =
      c.req.param("matchId") ??
      c.req.param("id") ??
      c.req.query("matchId");

    if (!matchId) {
      return next();
    }

    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
      columns: {
        status: true,
      },
    });

    if (!match) {
      return c.json({ error: "Match not found" }, 404);
    }

    if (
      match.status === "finished" ||
      match.status === "abandoned" ||
      match.status === "cancelled"
    ) {
      const user = c.get("user");

      if (user?.role === "ADMIN") {
        return next();
      }

      return c.json(
        {
          error: "Match is locked after full time",
          status: "LOCKED",
        },
        409,
      );
    }

    await next();
  });
