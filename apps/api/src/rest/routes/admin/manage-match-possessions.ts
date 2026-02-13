import { Hono } from "hono";
import { Session, User } from "lucia";
import { z } from "zod";
import { db } from "@football-intel/db/src/client";
import { matchPossessions, matches } from "@football-intel/db/src/schema/core";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { StatsJobs, statsQueue } from "@football-intel/queue";
import { computeMatchStats } from "@football-intel/domain";
import { requireRole } from "src/middleware/require-role";
import { enforceMatchUnlocked } from "src/middleware/match-lock";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

const upsertPossessionSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid().nullable().optional(),
  second: z.number().int().min(0).optional(),
  source: z.string().max(20).optional(),
});

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]));

app.get("/", async (c) => {
  const matchId = c.req.query("matchId");
  if (!matchId) {
    return c.json({ error: "matchId is required" }, 400);
  }

  const data = await db.query.matchPossessions.findMany({
    where: eq(matchPossessions.matchId, matchId),
    with: {
      team: true,
    },
    orderBy: [asc(matchPossessions.startSecond), asc(matchPossessions.createdAt)],
  });

  return c.json(data);
});

app.post("/", enforceMatchUnlocked(), async (c) => {
  const parsed = upsertPossessionSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { matchId, teamId, second, source } = parsed.data;

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match) {
    return c.json({ error: "Match not found" }, 404);
  }

  if (teamId && teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
    return c.json({ error: "Team does not belong to this match" }, 400);
  }

  const minuteBasedSecond = Math.max(0, (match.currentMinute ?? 0) * 60);
  const elapsedSecond = match.startedAt
    ? Math.max(
        0,
        Math.floor(
          ((match.endedAt ?? new Date()).getTime() - match.startedAt.getTime()) /
            1000,
        ),
      )
    : minuteBasedSecond;

  let referenceSecond = second ?? minuteBasedSecond;
  if (second === undefined) {
    if (match.startedAt && match.currentMinute !== null) {
      const upperBound = minuteBasedSecond + 59;
      referenceSecond = Math.min(
        Math.max(minuteBasedSecond, elapsedSecond),
        upperBound,
      );
    } else {
      referenceSecond = Math.max(minuteBasedSecond, elapsedSecond);
    }
  }

  const active = await db.query.matchPossessions.findFirst({
    where: and(eq(matchPossessions.matchId, matchId), isNull(matchPossessions.endSecond)),
    orderBy: [desc(matchPossessions.startSecond), desc(matchPossessions.createdAt)],
  });

  if (active && referenceSecond < active.startSecond) {
    return c.json({ error: "second cannot be before active possession start" }, 409);
  }

  let changed = false;

  if (active && (!teamId || active.teamId !== teamId) && referenceSecond === active.startSecond) {
    referenceSecond += 1;
  }

  if (active && (!teamId || active.teamId !== teamId)) {
    await db
      .update(matchPossessions)
      .set({ endSecond: referenceSecond })
      .where(eq(matchPossessions.id, active.id));
    changed = true;
  }

  if (teamId && (!active || active.teamId !== teamId)) {
    await db.insert(matchPossessions).values({
      matchId,
      teamId,
      startSecond: referenceSecond,
      source: source ?? "manual",
    });
    changed = true;
  }

  if (changed) {
    await computeMatchStats(matchId);
    await statsQueue.add(StatsJobs.RECOMPUTE_STATS, { matchId });
  }

  return c.json({ ok: true, changed, second: referenceSecond });
});

export default app;
