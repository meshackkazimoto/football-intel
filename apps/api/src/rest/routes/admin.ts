import { Hono } from "hono";
import { type User, type Session } from "lucia";
import { authMiddleware } from "../../middleware/auth";
import { db } from "@football-intel/db/src/client";
import {
  ingestionLogs,
  verificationRecords,
} from "@football-intel/db/src/schema/ingestion";
import { eq } from "drizzle-orm";
import {
  players,
  matches,
  clubs,
  matchEvents,
  teams,
} from "@football-intel/db/src/schema/core";
import { StatsJobs, statsQueue } from "@football-intel/queue";
import { logger } from "@football-intel/logger";
import { createRateLimiter } from "src/middleware/rate-limit";

console.log("Admin routes module loading...");

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", authMiddleware);

app.use("*", async (c, next) => {
  console.log(`Admin request: ${c.req.method} ${c.req.path}`);

  // Development bypass for testing
  if (
    process.env.NODE_ENV === "development" &&
    c.req.header("X-Admin-Test-Mode") === "true"
  ) {
    c.set("user", {
      id: "dev-admin-id",
      email: "dev@football-intel.com",
      role: "ADMIN",
    } as any);
    return next();
  }

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (user.role !== "ADMIN") {
    return c.json({ error: "Forbidden" }, 403);
  }
  return next();
});

app.post("/ingest", createRateLimiter(20, 60), async (c) => {
  const body = await c.req.json();

  const [row] = await db
    .insert(ingestionLogs)
    .values({
      type: body.type,
      source: "ADMIN",
      rawPayload: body.payload,
    })
    .returning();

  return c.json(row);
});

app.post("/verify/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  // 1. Save verification record
  await db.insert(verificationRecords).values({
    ingestionId: id,
    verifierUserId: c.get("user")!.id,
    confidenceScore: body.score,
    notes: body.notes,
  });

  // 2. Mark ingestion as verified
  const [ingestion] = await db
    .update(ingestionLogs)
    .set({ status: "verified" })
    .where(eq(ingestionLogs.id, id))
    .returning();

  if (!ingestion) {
    return c.json({ error: "Ingestion not found" }, 404);
  }

  logger.info({
    route: "verify",
    ingestionId: id,
    userId: c.get("user")?.id,
  });

  // 3. Dispatch queue job depending on type
  const payload = ingestion.rawPayload as {
    matchId?: string;
    seasonId?: string;
    id?: string;
    fullName?: string;
    clubName?: string;
  };

  switch (ingestion.type) {
    case "PLAYER": {
      const p = payload as any;
      const [insertedPlayer] = await db
        .insert(players)
        .values({
          firstName: p.firstName,
          lastName: p.lastName,
          fullName: p.fullName,
          slug: p.slug,
          nationalityId: p.nationalityId,
          preferredFoot: p.preferredFoot,
          height: p.height,
        })
        .onConflictDoNothing()
        .returning();

      const playerId = insertedPlayer?.id || p.id;

      await statsQueue.add(StatsJobs.INDEX_PLAYER, {
        id: playerId,
        fullName: p.fullName,
        clubName: p.clubName,
      });
      break;
    }

    case "MATCH": {
      const m = payload as any;
      const [insertedMatch] = await db
        .insert(matches)
        .values({
          seasonId: m.seasonId,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          matchDate: new Date(m.matchDate),
          status: m.status || "scheduled",
          venue: m.venue,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
        })
        .onConflictDoNothing()
        .returning();

      const matchId = insertedMatch?.id || m.id;

      if (matchId && m.status === "finished") {
        await statsQueue.add(StatsJobs.RECOMPUTE_STATS, { matchId });
      }
      if (m.seasonId) {
        await statsQueue.add(StatsJobs.RECOMPUTE_STANDINGS, {
          seasonId: m.seasonId,
        });
      }
      break;
    }

    case "MATCH_EVENT": {
      const e = payload as any;
      await db.insert(matchEvents).values({
        matchId: e.matchId,
        teamId: e.teamId,
        playerId: e.playerId,
        eventType: e.eventType,
        minute: e.minute,
      });

      if (e.matchId) {
        await statsQueue.add(StatsJobs.RECOMPUTE_STATS, {
          matchId: e.matchId,
        });
      }
      break;
    }

    case "CLUB": {
      const c = payload as any;
      await db
        .insert(clubs)
        .values({
          name: c.name,
          slug: c.slug,
          countryId: c.countryId,
          foundedYear: c.foundedYear,
          stadiumName: c.stadiumName,
          stadiumCapacity: c.stadiumCapacity,
        })
        .onConflictDoNothing();
      break;
    }
  }

  return c.json({ ok: true });
});

export default app;
