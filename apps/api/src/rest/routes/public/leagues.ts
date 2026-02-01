import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import {
  leagues,
  seasons,
  leagueStandings,
} from "@football-intel/db/src/schema/core";
import { eq, desc, asc } from "drizzle-orm";
import { createRateLimiter } from "../../../middleware/rate-limit";
import { Env } from "src/env";

const app = new Hono<Env>();

app.get("/", createRateLimiter(100, 60), async (c) => {
  const data = await db.query.leagues.findMany({
    with: { country: true },
  });
  return c.json(data);
});

app.get("/:id/seasons", createRateLimiter(100, 60), async (c) => {
  const leagueId = c.req.param("id");
  const data = await db.query.seasons.findMany({
    where: eq(seasons.leagueId, leagueId),
    orderBy: [desc(seasons.startDate)],
  });
  return c.json(data);
});

app.get("/standings", createRateLimiter(100, 60), async (c) => {
  const seasonId = c.req.query("seasonId");
  if (!seasonId) {
    return c.json({ error: "seasonId is required" }, 400);
  }

  const data = await db.query.leagueStandings.findMany({
    where: eq(leagueStandings.seasonId, seasonId),
    with: {
      team: {
        with: {
          club: true,
          season: {
            with: {
              league: {
                with: { country: true },
              },
            },
          },
        },
      },
    },
    orderBy: [asc(leagueStandings.position)],
  });

  return c.json({
    seasonId,
    league: {
      id: data[0]?.team.season.league.id,
      name: data[0]?.team.season.league.name,
      country: data[0]?.team.season.league.country.name,
      season: data[0]?.team.season.name,
    },
    standings: data.map((row) => ({
      position: row.position,
      team: {
        id: row.team.id,
        name: row.team.name,
        clubName: row.team.club.name,
      },
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points - (row.pointsDeduction ?? 0),
      status: row.status,
    })),
  });
});

export default app;
