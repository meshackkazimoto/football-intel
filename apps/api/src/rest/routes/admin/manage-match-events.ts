import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import {
    matches,
    matchEvents,
    players,
    playerContracts,
} from "@football-intel/db/src/schema/core";
import { and, eq, gte, lte, isNull, or } from "drizzle-orm";
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

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]));

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

    const matchDate = match.matchDate.toISOString().slice(0, 10);

    // 3. Validate player(s) if provided
    if (playerId) {
        const player = await db.query.players.findFirst({
            where: eq(players.id, playerId),
        });
        if (!player) {
            return c.json({ error: "Player not found" }, 400);
        }

        const contract = await db.query.playerContracts.findFirst({
            where: and(
                eq(playerContracts.playerId, playerId),
                eq(playerContracts.teamId, teamId),
                lte(playerContracts.startDate, matchDate),
                or(
                    isNull(playerContracts.endDate),
                    gte(playerContracts.endDate, matchDate),
                ),
            ),
        });

        if (!contract) {
            return c.json(
                { error: "Player is not assigned to this team for this match" },
                409,
            );
        }
    }

    if (relatedPlayerId) {
        const related = await db.query.players.findFirst({
            where: eq(players.id, relatedPlayerId),
        });
        if (!related) {
            return c.json({ error: "Related player not found" }, 400);
        }

        const relatedContract = await db.query.playerContracts.findFirst({
            where: and(
                eq(playerContracts.playerId, relatedPlayerId),
                eq(playerContracts.teamId, teamId),
                lte(playerContracts.startDate, matchDate),
                or(
                    isNull(playerContracts.endDate),
                    gte(playerContracts.endDate, matchDate),
                ),
            ),
        });

        if (!relatedContract) {
            return c.json(
                {
                    error:
                        "Related player is not assigned to this team for this match",
                },
                409,
            );
        }
    }

    // 4. Deduplication check
    const duplicate = await db.query.matchEvents.findFirst({
        where: and(
            eq(matchEvents.matchId, matchId),
            eq(matchEvents.teamId, teamId),
            eq(matchEvents.eventType, eventType),
            eq(matchEvents.minute, minute),
            playerId ? eq(matchEvents.playerId, playerId) : undefined,
        ),
    });

    if (duplicate) {
        return c.json(
            {
                error: "Duplicate match event detected",
                code: "DUPLICATE_EVENT",
            },
            409,
        );
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
