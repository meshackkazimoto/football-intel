import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import {
  players,
  playerSeasonStats,
  playerContracts,
  playerMatchRatings,
} from "@football-intel/db/src/schema/core";
import { eq, desc, and } from "drizzle-orm";
import { createRateLimiter } from "../../middleware/rate-limit";
import { cacheMiddleware } from "../../middleware/cache";
import {
  paginationSchema,
  getPaginationOffset,
} from "@football-intel/validation";
import { Env } from "src/env";

const app = new Hono<Env>();

app.get("/", createRateLimiter(100, 60), cacheMiddleware(60), async (c) => {
  const query = paginationSchema.parse(c.req.query());
  const offset = getPaginationOffset(query.page, query.limit);

  const data = await db.query.players.findMany({
    limit: query.limit,
    offset: offset,
  });

  return c.json({
    data,
    page: query.page,
    limit: query.limit,
  });
});

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

app.get("/:id/ratings", createRateLimiter(50, 60), async (c) => {
  const id = c.req.param("id");
  const data = await db.query.playerMatchRatings.findMany({
    where: eq(playerMatchRatings.playerId, id),
    with: {
      match: {
        with: {
          homeTeam: { with: { club: true } },
          awayTeam: { with: { club: true } },
        },
      },
    },
    orderBy: [desc(playerMatchRatings.createdAt)],
    limit: 10,
  });

  return c.json(data);
});

export default app;
