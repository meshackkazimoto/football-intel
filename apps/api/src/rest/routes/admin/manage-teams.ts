import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { teams, clubs, seasons } from "@football-intel/db/src/schema/core";
import { eq, and } from "drizzle-orm";
import {
  createTeamSchema,
  updateTeamSchema,
} from "@football-intel/validation";
import { logger } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", requireRole(["ADMIN"]));

app.post("/", async (c) => {
  const body = createTeamSchema.parse(await c.req.json());

  // Validate club exists
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.id, body.clubId),
  });
  if (!club) {
    return c.json({ error: "Club not found" }, 400);
  }

  // Validate season exists
  const season = await db.query.seasons.findFirst({
    where: eq(seasons.id, body.seasonId),
  });
  if (!season) {
    return c.json({ error: "Season not found" }, 400);
  }

  // Prevent duplicate club-season
  const existing = await db.query.teams.findFirst({
    where: and(
      eq(teams.clubId, body.clubId),
      eq(teams.seasonId, body.seasonId),
    ),
  });
  if (existing) {
    return c.json(
      { error: "Team already exists for this club and season" },
      409,
    );
  }

  const [team] = await db
    .insert(teams)
    .values(body)
    .returning();

  logger.info(
    {
      teamId: team.id,
      clubId: body.clubId,
      seasonId: body.seasonId,
      adminId: c.get("user")?.id,
    },
    "Team created",
  );

  return c.json(team, 201);
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateTeamSchema.parse(await c.req.json());

  const [updated] = await db
    .update(teams)
    .set(body)
    .where(eq(teams.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Team not found" }, 404);
  }

  logger.info(
    { teamId: id, adminId: c.get("user")?.id },
    "Team updated",
  );

  return c.json(updated);
});

app.get("/", async (c) => {
  const clubId = c.req.query("clubId");
  const seasonId = c.req.query("seasonId");

  const results = await db.query.teams.findMany({
    where:
      clubId && seasonId
        ? and(eq(teams.clubId, clubId), eq(teams.seasonId, seasonId))
        : clubId
          ? eq(teams.clubId, clubId)
          : seasonId
            ? eq(teams.seasonId, seasonId)
            : undefined,
    with: {
      club: true,
      season: true,
    },
  });

  return c.json(results);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(teams)
    .where(eq(teams.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Team not found" }, 404);
  }

  logger.warn(
    { teamId: id, adminId: c.get("user")?.id },
    "Team deleted",
  );

  return c.json({ ok: true });
});

export default app;