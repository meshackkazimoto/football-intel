import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import {
  teams,
  clubs,
  playerContracts,
} from "@football-intel/db/src/schema/core";
import { eq, and } from "drizzle-orm";
import { createRateLimiter } from "../../middleware/rate-limit";

const app = new Hono();

/**
 * GET /teams
 */
app.get("/", createRateLimiter(100, 60), async (c) => {
  const seasonId = c.req.query("seasonId");

  const data = await db.query.teams.findMany({
    where: seasonId ? eq(teams.seasonId, seasonId) : undefined,
    with: {
      club: true,
      season: true,
    },
  });

  return c.json(data);
});

/**
 * GET /teams/:id
 */
app.get("/:id", createRateLimiter(100, 60), async (c) => {
  const id = c.req.param("id");
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, id),
    with: {
      club: true,
      season: true,
      contracts: {
        where: eq(playerContracts.isCurrent, true),
        with: {
          player: true,
        },
      },
    },
  });

  if (!team) {
    return c.json({ error: "Team not found" }, 404);
  }

  return c.json(team);
});

export default app;
