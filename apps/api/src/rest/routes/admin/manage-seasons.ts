import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { seasons, leagues } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import {
  createSeasonSchema,
  updateSeasonSchema,
} from "@football-intel/validation";
import { logger } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN"]));

app.post("/", async (c) => {
  const body = createSeasonSchema.parse(await c.req.json());

  // Validate league
  const league = await db.query.leagues.findFirst({
    where: eq(leagues.id, body.leagueId),
  });
  if (!league) {
    return c.json({ error: "League not found" }, 400);
  }

  // If setting current season → unset previous current
  if (body.isCurrent) {
    await db
      .update(seasons)
      .set({ isCurrent: false })
      .where(eq(seasons.leagueId, body.leagueId));
  }

  const [season] = await db
    .insert(seasons)
    .values({
      leagueId: body.leagueId,
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
      isCurrent: body.isCurrent ?? false,
    })
    .returning();

  logger.info(
    {
      seasonId: season.id,
      leagueId: body.leagueId,
      adminId: c.get("user")?.id,
    },
    "Season created",
  );

  return c.json(season, 201);
});


app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateSeasonSchema.parse(await c.req.json());

  const existing = await db.query.seasons.findFirst({
    where: eq(seasons.id, id),
  });
  if (!existing) {
    return c.json({ error: "Season not found" }, 404);
  }

  // Handle isCurrent switch
  if (body.isCurrent === true) {
    await db
      .update(seasons)
      .set({ isCurrent: false })
      .where(eq(seasons.leagueId, existing.leagueId));
  }

  const [updated] = await db
    .update(seasons)
    .set(body)
    .where(eq(seasons.id, id))
    .returning();

  logger.info(
    { seasonId: id, adminId: c.get("user")?.id },
    "Season updated",
  );

  return c.json(updated);
});

app.get("/", async (c) => {
  const leagueId = c.req.query("leagueId");

  const results = await db.query.seasons.findMany({
    where: leagueId ? eq(seasons.leagueId, leagueId) : undefined,
    with: {
      league: true,
    },
    orderBy: (s, { desc }) => [desc(s.startDate)],
  });

  return c.json({ data: results });
});

app.get("/current/:leagueId", async (c) => {
  const leagueId = c.req.param("leagueId");

  const season = await db.query.seasons.findFirst({
    where: (s) =>
      eq(s.leagueId, leagueId) && eq(s.isCurrent, true),
  });

  if (!season) {
    return c.json({ error: "Current season not found" }, 404);
  }

  return c.json(season);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(seasons)
    .where(eq(seasons.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Season not found" }, 404);
  }

  logger.warn(
    { seasonId: id, adminId: c.get("user")?.id },
    "Season deleted",
  );

  return c.json({ ok: true });
});

export default app;