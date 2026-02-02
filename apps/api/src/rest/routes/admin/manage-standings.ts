import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import {
  leagueStandings,
  teams,
  seasons,
} from "@football-intel/db/src/schema/core";
import { eq, and } from "drizzle-orm";
import {
  CreateStandingSchema,
  UpdateStandingSchema,
} from "@football-intel/validation";
import { logger } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]));

// Create a new standing entry
app.post("/", async (c) => {
  const body = CreateStandingSchema.parse(await c.req.json());

  // Validate season
  const season = await db.query.seasons.findFirst({
    where: eq(seasons.id, body.seasonId),
  });
  if (!season) {
    return c.json({ error: "Season not found" }, 400);
  }

  // Validate team
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, body.teamId),
  });
  if (!team) {
    return c.json({ error: "Team not found" }, 400);
  }

  // Check uniqueness
  const existing = await db.query.leagueStandings.findFirst({
    where: and(
      eq(leagueStandings.seasonId, body.seasonId),
      eq(leagueStandings.teamId, body.teamId),
    ),
  });

  if (existing) {
    return c.json(
      { error: "Team is already in standings for this season" },
      409,
    );
  }

  const [standing] = await db.insert(leagueStandings).values(body).returning();

  logger.info(
    { standingId: standing.id, adminId: c.get("user")?.id },
    "Standing entry created",
  );

  return c.json(standing, 201);
});

// Update a standing entry
app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = UpdateStandingSchema.parse(await c.req.json());

  const [updated] = await db
    .update(leagueStandings)
    .set({
      ...body,
      lastComputedAt: new Date(),
    })
    .where(eq(leagueStandings.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Standing not found" }, 404);
  }

  logger.info(
    { standingId: id, adminId: c.get("user")?.id },
    "Standing entry updated",
  );

  return c.json(updated);
});

// Get standings (filtered by season)
app.get("/", async (c) => {
  const seasonId = c.req.query("seasonId");

  const data = await db.query.leagueStandings.findMany({
    where: seasonId ? eq(leagueStandings.seasonId, seasonId) : undefined,
    with: {
      team: true,
      season: true,
    },
    orderBy: (s, { asc }) => [asc(s.position)],
  });

  return c.json({ data });
});

// Delete a standing entry
app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(leagueStandings)
    .where(eq(leagueStandings.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Standing not found" }, 404);
  }

  logger.info(
    { standingId: id, adminId: c.get("user")?.id },
    "Standing entry deleted",
  );

  return c.json({ ok: true });
});

export default app;
