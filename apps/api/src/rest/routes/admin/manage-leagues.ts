import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { leagues, countries, seasons } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import {
    CreateLeagueSchema,
    UpdateLeagueSchema,
} from "@football-intel/validation";
import { logger } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
    Variables: {
        user: User | null;
        session: Session | null;
    };
}>();

app.post("/", requireRole(["ADMIN"]), async (c) => {
    const parsed = CreateLeagueSchema.safeParse(await c.req.json());
    if (!parsed.success) {
        return c.json({ error: parsed.error.flatten() }, 400);
    }

    let { countryId, ...data } = parsed.data;

    // Default to Tanzania if not provided
    if (!countryId) {
        const tz = await db.query.countries.findFirst({
            where: eq(countries.code, "TZA"),
        });
        if (!tz) {
            return c.json({ error: "Default country not found" }, 400);
        }
        countryId = tz.id;
    }

    const [league] = await db
        .insert(leagues)
        .values({
            ...data,
            countryId,
        })
        .returning();

    logger.info(
        { leagueId: league.id, admin: c.get("user")?.id },
        "League created",
    );

    return c.json(league, 201);
});

app.patch("/:id", requireRole(["ADMIN"]), async (c) => {
    const body = await c.req.json();
    const parsed = UpdateLeagueSchema.safeParse({
        ...body,
        id: c.req.param("id"),
    });

    if (!parsed.success) {
        return c.json({ error: parsed.error.flatten() }, 400);
    }

    const { id, ...update } = parsed.data;

    const [updated] = await db
        .update(leagues)
        .set(update)
        .where(eq(leagues.id, id))
        .returning();

    if (!updated) {
        return c.json({ error: "League not found" }, 404);
    }

    logger.info(
        { leagueId: id, admin: c.get("user")?.id },
        "League updated",
    );

    return c.json(updated);
});

app.get("/", requireRole(["MODERATOR"]), async (c) => {
    const countryId = c.req.query("countryId");

    const data = await db.query.leagues.findMany({
        where: countryId ? eq(leagues.countryId, countryId) : undefined,
        with: {
            country: true,
        },
        orderBy: (l, { asc }) => [asc(l.tier)],
    });

    return c.json(data);
});

app.delete("/:id", requireRole(["ADMIN"]), async (c) => {
    const id = c.req.param("id");

    const existingSeason = await db.query.seasons.findFirst({
        where: eq(seasons.leagueId, id),
    });

    if (existingSeason) {
        return c.json(
            { error: "Cannot delete league with seasons" },
            409,
        );
    }

    const [deleted] = await db
        .delete(leagues)
        .where(eq(leagues.id, id))
        .returning();

    if (!deleted) {
        return c.json({ error: "League not found" }, 404);
    }

    logger.warn(
        { leagueId: id, admin: c.get("user")?.id },
        "League deleted",
    );

    return c.json({ ok: true });
});

export default app;