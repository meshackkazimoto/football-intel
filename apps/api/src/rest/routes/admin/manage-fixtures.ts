import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { matches, teams, seasons } from "@football-intel/db/src/schema/core";
import { and, eq, inArray } from "drizzle-orm";
import {
    createFixtureSchema,
    updateFixtureSchema,
} from "@football-intel/validation";
import { StatsJobs, statsQueue } from "@football-intel/queue";
import { logger } from "@football-intel/logger";

const app = new Hono<{
    Variables: {
        user: User | null;
        session: Session | null;
    };
}>();

app.post("/", async (c) => {
    const body = createFixtureSchema.parse(await c.req.json());

    if (body.homeTeamId === body.awayTeamId) {
        return c.json({ error: "Teams must be different" }, 400);
    }

    // Validate season
    const season = await db.query.seasons.findFirst({
        where: eq(seasons.id, body.seasonId),
    });
    if (!season) {
        return c.json({ error: "Season not found" }, 400);
    }

    // Validate teams belong to season
    const teamsCount = await db.query.teams.findMany({
        where: and(
            eq(teams.seasonId, body.seasonId),
            inArray(teams.id, [body.homeTeamId, body.awayTeamId]),
        ),
    });
    if (teamsCount.length !== 2) {
        return c.json(
            { error: "Both teams must belong to the same season" },
            400,
        );
    }

    const [fixture] = await db
        .insert(matches)
        .values({
            seasonId: body.seasonId,
            homeTeamId: body.homeTeamId,
            awayTeamId: body.awayTeamId,
            matchDate: new Date(body.matchDate),
            venue: body.venue,
            status: "scheduled",
        })
        .returning();

    logger.info(
        {
            matchId: fixture.id,
            adminId: c.get("user")?.id,
        },
        "Fixture created",
    );

    return c.json(fixture, 201);
});

app.patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = updateFixtureSchema.parse(await c.req.json());

    const updateData = {
        status: body.status,
        venue: body.venue,
        homeScore: body.homeScore,
        awayScore: body.awayScore,
        currentMinute: body.currentMinute,
        period: body.period,
        matchDate: body.matchDate ? new Date(body.matchDate) : undefined,
        startedAt: body.startedAt ? new Date(body.startedAt) : undefined,
        endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
    };

    const [updated] = await db
        .update(matches)
        .set(updateData)
        .where(eq(matches.id, id))
        .returning();

    if (!updated) {
        return c.json({ error: "Fixture not found" }, 404);
    }

    // Trigger stats & standings on finish
    if (body.status === "finished") {
        await statsQueue.add(StatsJobs.RECOMPUTE_STATS, {
            matchId: id,
        });
        await statsQueue.add(StatsJobs.RECOMPUTE_STANDINGS, {
            seasonId: updated.seasonId,
        });
    }

    logger.info(
        {
            matchId: id,
            status: body.status,
            adminId: c.get("user")?.id,
        },
        "Fixture updated",
    );

    return c.json(updated);
});

app.get("/", async (c) => {
    const seasonId = c.req.query("seasonId");
    const status = c.req.query("status");

    const fixtures = await db.query.matches.findMany({
        where:
            seasonId && status
                ? and(
                    eq(matches.seasonId, seasonId),
                    eq(matches.status, status),
                )
                : seasonId
                    ? eq(matches.seasonId, seasonId)
                    : status
                        ? eq(matches.status, status)
                        : undefined,
        with: {
            homeTeam: true,
            awayTeam: true,
        },
        orderBy: (m, { asc }) => [asc(m.matchDate)],
    });

    return c.json(fixtures);
});

app.delete("/:id", async (c) => {
    const id = c.req.param("id");

    const [deleted] = await db
        .delete(matches)
        .where(eq(matches.id, id))
        .returning();

    if (!deleted) {
        return c.json({ error: "Fixture not found" }, 404);
    }

    logger.warn(
        { matchId: id, adminId: c.get("user")?.id },
        "Fixture deleted",
    );

    return c.json({ ok: true });
});

export default app;