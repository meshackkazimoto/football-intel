import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import { clubs, seasons, teams } from "@football-intel/db/src/schema/core";
import { desc, eq } from "drizzle-orm";
import { createRateLimiter } from "../../middleware/rate-limit";
import { Env } from "src/env";

const app = new Hono<Env>();

app.get("/", createRateLimiter(100, 60), async (c) => {
  const data = await db.query.clubs.findMany({
    with: { country: true },
  });
  return c.json(data);
});

app.get("/:id", createRateLimiter(100, 60), async (c) => {
  const id = c.req.param("id");
  const club = await db.query.clubs.findFirst({
    where: eq(clubs.id, id),
    with: {
      country: true,
      teams: {
        with: { season: true },
      },
    },
  });

  if (!club) {
    return c.json({ error: "Club not found" }, 404);
  }

  return c.json(club);
});

app.get("/:id/current-team", createRateLimiter(100, 60), async (c) => {
  const clubId = c.req.param("id");

  const club = await db.query.clubs.findFirst({
    where: eq(clubs.id, clubId),
  });

  if (!club) {
    return c.json({ error: "Club not found" }, 404);
  }

  let team = await db.query.teams.findFirst({
    where: eq(teams.clubId, clubId),
    with: {
      season: true,
    },
    orderBy: [
      desc(seasons.isCurrent),
      desc(seasons.startDate),
    ],
  });

  if (!team) {
    return c.json(
      { error: "No active team found for this club" },
      404
    );
  }

  return c.json({
    club: {
      id: club.id,
      name: club.name,
    },
    team: {
      id: team.id,
      name: team.name,
      season: {
        id: team.season.id,
        name: team.season.name,
        isCurrent: team.season.isCurrent,
      },
    },
  });
});

export default app;
