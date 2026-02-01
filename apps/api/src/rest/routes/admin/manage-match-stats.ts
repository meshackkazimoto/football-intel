import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { matchStats, matches } from "@football-intel/db/src/schema/core";
import { eq, and } from "drizzle-orm";
import { MatchStatsSchema } from "@football-intel/validation";
import { StatsJobs, statsQueue } from "@football-intel/queue";
import { logger } from "@football-intel/logger";

const app = new Hono<{
    Variables: {
        user: User | null;
        session: Session | null;
    };
}>();

app.post("/", async (c) => {
    const body = await c.req.json();
    const parsed = MatchStatsSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: parsed.error.flatten() }, 400);
    }

    const { matchId, teamId, ...stats } = parsed.data;

    // 1. Validate match
    const match = await db.query.matches.findFirst({
        where: eq(matches.id, matchId),
    });

    if (!match) {
        return c.json({ error: "Match not found" }, 404);
    }

    // 2. Ensure team belongs to match
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
        return c.json(
            { error: "Team does not belong to this match" },
            400,
        );
    }

    // 3. Upsert match stats
    const [existing] = await db
        .select()
        .from(matchStats)
        .where(
            and(
                eq(matchStats.matchId, matchId),
                eq(matchStats.teamId, teamId),
            ),
        );

    if (match.status === "scheduled") {
        return c.json(
            { error: "Cannot update stats for a scheduled match" },
            400,
        );
    }

    if (existing) {
        await db
            .update(matchStats)
            .set({
                ...stats,
            })
            .where(eq(matchStats.id, existing.id));
    } else {
        await db.insert(matchStats).values({
            matchId,
            teamId,
            ...stats,
        });
    }

    logger.info(
        {
            matchId,
            teamId,
            updatedBy: c.get("user")?.id,
        },
        "Match stats updated",
    );

    // 4. Trigger async recalculation
    await statsQueue.add(StatsJobs.RECOMPUTE_STATS, { matchId });

    return c.json({ ok: true });
});

export default app;