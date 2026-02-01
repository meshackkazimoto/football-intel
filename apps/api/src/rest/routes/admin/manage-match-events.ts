import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import {
    matches,
    matchEvents,
    teams,
    players,
} from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { MatchEventSchema } from "@football-intel/validation";
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

app.use("*", requireRole(["ADMIN", "MODERATOR"]));

app.post("/", enforceMatchUnlocked(), async (c) => {
    const body = await c.req.json();
    const parsed = MatchEventSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: parsed.error.flatten() }, 400);
    }

    const {
        matchId,
        teamId,
        eventType,
        minute,
        playerId,
        relatedPlayerId,
    } = parsed.data;

    // 1. Validate match
    const match = await db.query.matches.findFirst({
        where: eq(matches.id, matchId),
    });

    if (!match) {
        return c.json({ error: "Match not found" }, 404);
    }

    if (!["live", "half_time", "finished"].includes(match.status)) {
        return c.json(
            { error: "Match is not live or finished" },
            400,
        );
    }

    // 2. Validate team belongs to match
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
        return c.json(
            { error: "Team does not belong to this match" },
            400,
        );
    }

    // 3. Validate player(s) if provided
    if (playerId) {
        const player = await db.query.players.findFirst({
            where: eq(players.id, playerId),
        });
        if (!player) {
            return c.json({ error: "Player not found" }, 400);
        }
    }

    if (relatedPlayerId) {
        const related = await db.query.players.findFirst({
            where: eq(players.id, relatedPlayerId),
        });
        if (!related) {
            return c.json({ error: "Related player not found" }, 400);
        }
    }

    // 4. Insert event
    await db.insert(matchEvents).values({
        matchId,
        teamId,
        playerId,
        eventType,
        minute,
    });

    if (eventType === "goal") {
        const scoreUpdate =
            teamId === match.homeTeamId
                ? { homeScore: (match.homeScore ?? 0) + 1 }
                : { awayScore: (match.awayScore ?? 0) + 1 };

        await db
            .update(matches)
            .set(scoreUpdate)
            .where(eq(matches.id, matchId));
    }

    logger.info(
        {
            matchId,
            teamId,
            eventType,
            minute,
            admin: c.get("user")?.id,
        },
        "Match event recorded",
    );

    // 5. Trigger async recomputation
    await statsQueue.add(StatsJobs.RECOMPUTE_STATS, { matchId });

    return c.json({ ok: true });
});

export default app;