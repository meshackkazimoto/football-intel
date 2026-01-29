import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { db } from "@football-intel/db/src/client";
import { matches, matchEvents } from "@football-intel/db/src/schema/core";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { createRateLimiter } from "../../middleware/rate-limit";

const app = new Hono();

/**
 * GET /matches
 * List all matches with optional filters
 */
app.get("/", createRateLimiter(50, 60), async (c) => {
  const seasonId = c.req.query("seasonId");
  const status = c.req.query("status"); // scheduled | finished

  const data = await db.query.matches.findMany({
    where: and(
      seasonId ? eq(matches.seasonId, seasonId) : undefined,
      status ? eq(matches.status, status) : undefined,
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [desc(matches.matchDate)],
  });

  return c.json(data);
});

/**
 * GET /matches/today
 */
app.get("/today", createRateLimiter(50, 60), async (c) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const data = await db.query.matches.findMany({
    where: and(
      gte(matches.matchDate, startOfDay),
      lte(matches.matchDate, endOfDay),
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [asc(matches.matchDate)],
  });

  return c.json(data);
});

/**
 * GET /matches/recent
 * Recently finished matches (last 7 days by default)
 */
app.get("/recent", createRateLimiter(50, 60), async (c) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const data = await db.query.matches.findMany({
    where: and(
      eq(matches.status, "finished"),
      gte(matches.matchDate, sevenDaysAgo),
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [desc(matches.matchDate)],
    limit: 20,
  });

  return c.json(data);
});

/**
 * GET /matches/upcoming
 * Upcoming fixtures (next 7 days)
 */
app.get("/upcoming", createRateLimiter(50, 60), async (c) => {
  const now = new Date();
  const sevenDaysAhead = new Date();
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);

  const data = await db.query.matches.findMany({
    where: and(
      eq(matches.status, "scheduled"),
      gte(matches.matchDate, now),
      lte(matches.matchDate, sevenDaysAhead),
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [asc(matches.matchDate)],
    limit: 20,
  });

  return c.json(data);
});

/**
 * GET /matches/:id/result
 * Detailed result including score breakdown and goal timeline
 */
app.get("/:id/result", createRateLimiter(100, 60), async (c) => {
  const id = c.req.param("id");

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, id),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
      events: {
        with: {
          player: true,
          team: true,
        },
        orderBy: [asc(matchEvents.minute)],
      },
      lineups: {
        with: {
          player: true,
        },
      },
    },
  });

  if (!match) {
    return c.json({ error: "Match not found" }, 404);
  }

  // Formatting response
  const response = {
    ...match,
    timeline: match.events.map((event) => ({
      minute: event.minute,
      player: event.player,
      teamId: event.teamId,
      type: event.eventType,
    })),
    lineups: {
      home: match.lineups.filter((l) => l.teamId === match.homeTeamId),
      away: match.lineups.filter((l) => l.teamId === match.awayTeamId),
    },
    scoreBreakdown: {
      fullTime: {
        home: match.homeScore,
        away: match.awayScore,
      },
    },
  };

  return c.json(response);
});

/**
 * GET /matches/:id/live-stream
 * SSE endpoint for live match updates
 */
app.get("/:id/live-stream", async (c) => {
  const id = c.req.param("id");

  return streamSSE(c, async (stream) => {
    while (true) {
      const match = await db.query.matches.findFirst({
        where: eq(matches.id, id),
        with: {
          events: {
            orderBy: [desc(matchEvents.createdAt)],
            limit: 1,
          },
        },
      });

      if (match) {
        await stream.writeSSE({
          data: JSON.stringify(match),
          event: "match-update",
          id: String(Date.now()),
        });
      }

      await stream.sleep(5000); // Poll every 5 seconds for simulation
    }
  });
});

export default app;
