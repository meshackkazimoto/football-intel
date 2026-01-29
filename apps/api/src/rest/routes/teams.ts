import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import {
  teams,
  clubs,
  playerContracts,
  matches,
} from "@football-intel/db/src/schema/core";
import { eq, and, desc, sql } from "drizzle-orm";
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

/**
 * GET /teams/:id/stats
 */
app.get("/:id/stats", createRateLimiter(50, 60), async (c) => {
  const id = c.req.param("id");

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, id),
    with: {
      club: true,
      season: true,
      standings: true,
    },
  });

  if (!team) return c.json({ error: "Team not found" }, 404);

  // Fetch last 5 matches for form
  const recentMatches = await db.query.matches.findMany({
    where: and(
      eq(matches.status, "finished"),
      sql`(${matches.homeTeamId} = ${id} OR ${matches.awayTeamId} = ${id})`,
    ),
    orderBy: [desc(matches.matchDate)],
    limit: 5,
  });

  const form = recentMatches.map((m) => {
    const isHome = m.homeTeamId === id;
    if (m.homeScore === m.awayScore) return "D";
    if (isHome) return m.homeScore! > m.awayScore! ? "W" : "L";
    return m.awayScore! > m.homeScore! ? "W" : "L";
  });

  // Home vs Away performance
  const allMatchHistory = await db.query.matches.findMany({
    where: and(
      eq(matches.status, "finished"),
      sql`(${matches.homeTeamId} = ${id} OR ${matches.awayTeamId} = ${id})`,
    ),
  });

  const homeMatches = allMatchHistory.filter((m) => m.homeTeamId === id);
  const awayMatches = allMatchHistory.filter((m) => m.awayTeamId === id);

  const homePerformance = {
    played: homeMatches.length,
    wins: homeMatches.filter((m) => m.homeScore! > m.awayScore!).length,
    draws: homeMatches.filter((m) => m.homeScore === m.awayScore).length,
    losses: homeMatches.filter((m) => m.homeScore! < m.awayScore!).length,
  };

  const awayPerformance = {
    played: awayMatches.length,
    wins: awayMatches.filter((m) => m.awayScore! > m.homeScore!).length,
    draws: awayMatches.filter((m) => m.awayScore === m.homeScore).length,
    losses: awayMatches.filter((m) => m.awayScore! < m.homeScore!).length,
  };

  const stats = {
    ...team.standings[0],
    form,
    homePerformance,
    awayPerformance,
    averageGoals: team.standings[0]
      ? (team.standings[0].goalsFor / team.standings[0].played).toFixed(2)
      : 0,
    winRatio: team.standings[0]
      ? ((team.standings[0].wins / team.standings[0].played) * 100).toFixed(1) +
        "%"
      : "0%",
  };

  return c.json(stats);
});

export default app;
