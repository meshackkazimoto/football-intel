import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import {
  players,
  playerSeasonStats,
  playerContracts,
} from "@football-intel/db/src/schema/core";
import { eq, desc, and } from "drizzle-orm";
import { createRateLimiter } from "../../middleware/rate-limit";

const app = new Hono();

/**
 * GET /players
 * List players with optional search
 */
app.get("/", createRateLimiter(100, 60), async (c) => {
  const data = await db.query.players.findMany({
    limit: 50,
  });
  return c.json(data);
});

/**
 * GET /players/:id
 * Detailed player profile
 */
app.get("/:id", createRateLimiter(100, 60), async (c) => {
  const id = c.req.param("id");
  const player = await db.query.players.findFirst({
    where: eq(players.id, id),
    with: {
      nationality: true,
      contracts: {
        with: {
          team: { with: { club: true } },
        },
        orderBy: [desc(playerContracts.startDate)],
      },
      stats: {
        with: {
          season: true,
          team: { with: { club: true } },
        },
        orderBy: [desc(playerSeasonStats.lastComputedAt)],
      },
      transfers: {
        with: {
          fromClub: true,
          toClub: true,
          season: true,
        },
      },
    },
  });

  if (!player) {
    return c.json({ error: "Player not found" }, 404);
  }

  return c.json(player);
});

/**
 * GET /players/:id/stats
 */
app.get("/:id/stats", createRateLimiter(50, 60), async (c) => {
  const id = c.req.param("id");
  const seasonId = c.req.query("seasonId");

  const stats = await db.query.playerSeasonStats.findMany({
    where: and(
      eq(playerSeasonStats.playerId, id),
      seasonId ? eq(playerSeasonStats.seasonId, seasonId) : undefined,
    ),
    with: {
      season: true,
      team: { with: { club: true } },
    },
    orderBy: [desc(playerSeasonStats.lastComputedAt)],
  });

  return c.json(stats);
});

export default app;
