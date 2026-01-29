import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import { clubs } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { createRateLimiter } from "../../middleware/rate-limit";

const app = new Hono();

/**
 * GET /clubs
 */
app.get("/", createRateLimiter(100, 60), async (c) => {
  const data = await db.query.clubs.findMany({
    with: { country: true },
  });
  return c.json(data);
});

/**
 * GET /clubs/:id
 */
app.get("/:id", createRateLimiter(100, 60), async (c) => {
  const id = c.req.param("id");
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.id, id),
    with: {
      country: true,
      teams: {
        with: { season: true },
      },
    },
  });

  if (!club) {
    return c.json({ error: "Club not found" }, 404);
  }

  return c.json(club);
});

export default app;
