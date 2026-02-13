import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { MatchStatusSchema } from "@football-intel/validation";
import { StatsJobs, statsQueue } from "@football-intel/queue";
import { logger } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";
import { enforceMatchUnlocked } from "src/middleware/match-lock";

const app = new Hono<{
    Variables: {
        user: User | null;
        session: Session | null;
    };
}>();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]));

app.post("/", enforceMatchUnlocked(), async (c) => {
    const body = await c.req.json();
    const parsed = MatchStatusSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: parsed.error.flatten() }, 400);
    }

    const { matchId, status, currentMinute } = parsed.data;

    const match = await db.query.matches.findFirst({
        where: eq(matches.id, matchId),
    });

    if (!match) {
        return c.json({ error: "Match not found" }, 404);
    }

    const now = new Date();

    const allowedTransitions: Record<string, string[]> = {
        scheduled: ["live", "postponed", "cancelled"],
        live: ["half_time", "finished", "abandoned", "postponed"],
        half_time: ["live", "finished", "abandoned", "postponed"],
        postponed: ["scheduled", "live", "cancelled"],
        abandoned: [],
        cancelled: [],
        finished: [],
    };

    if (!allowedTransitions[match.status]?.includes(status)) {
        return c.json(
            { error: `Invalid status transition from ${match.status} to ${status}` },
            400,
        );
    }

    if (status === "finished") {
        if (match.homeScore === null || match.awayScore === null) {
            return c.json(
                {
                    error:
                        "Cannot finish match without both homeScore and awayScore; set final score first.",
                },
                409,
            );
        }
    }

    const update: Partial<typeof matches.$inferInsert> = {
        status,
        currentMinute,
    };

    if (status === "live" && match.status === "scheduled") {
        update.startedAt = now;
        update.period = "1H";
    }

    if (status === "half_time") {
        update.period = "HT";
    }

    if (status === "live" && match.period === "HT") {
        update.period = "2H";
    }

    if (status === "finished" || status === "abandoned" || status === "cancelled") {
        update.endedAt = now;
        update.period = "FT";
        if (status === "finished") {
          update.currentMinute ??= 90;
        }
    }

    await db
        .update(matches)
        .set(update)
        .where(eq(matches.id, matchId));

    logger.info(
        {
            matchId,
            status,
            updatedBy: c.get("user")?.id,
        },
        "Match status updated",
    );

    // Trigger async intelligence
    if (status === "finished") {
        await statsQueue.add(StatsJobs.RECOMPUTE_STATS, { matchId });
        await statsQueue.add(StatsJobs.RECOMPUTE_STANDINGS, {
            seasonId: match.seasonId,
        });
    }

    return c.json({ ok: true });
});

export default app;
