import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import {
  leagues,
  seasons,
  leagueStandings,
} from "@football-intel/db/src/schema/core";
import { eq, desc } from "drizzle-orm";
import { createRateLimiter } from "../../middleware/rate-limit";

const app = new Hono();

/**
 * GET /leagues
 */
app.get("/", createRateLimiter(100, 60), async (c) => {
  const data = await db.query.leagues.findMany({
    with: { country: true },
  });
  return c.json(data);
});

/**
 * GET /leagues/:id/seasons
 */
app.get("/:id/seasons", createRateLimiter(100, 60), async (c) => {
  const leagueId = c.req.param("id");
  const data = await db.query.seasons.findMany({
    where: eq(seasons.leagueId, leagueId),
    orderBy: [desc(seasons.startDate)],
  });
  return c.json(data);
});

/**
 * GET /leagues/standings
 * Get standings for a specific season
 */
app.get("/standings", createRateLimiter(100, 60), async (c) => {
  const seasonId = c.req.query("seasonId");

  if (!seasonId) {
    return c.json({ error: "seasonId is required" }, 400);
  }

  const data = await db.query.leagueStandings.findMany({
    where: eq(leagueStandings.seasonId, seasonId),
    with: {
      team: {
        with: { club: true },
      },
    },
    orderBy: [
      desc(leagueStandings.points),
      desc(leagueStandings.goalDifference),
    ],
  });

  return c.json(data);
});

export default app;
