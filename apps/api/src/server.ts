import dotenv from "dotenv";

import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import {
  countries,
  leagues,
  clubs,
  teams,
  players,
  matches,
  leagueStandings,
} from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { yoga } from "./graphql/server";
import admin from "./rest/routes/admin";

console.log("DB URL:", process.env.DATABASE_URL);

const app = new Hono();

app.route("/admin", admin);

/**
 * Health
 */
app.get("/health", (c) => {
  return c.json({ status: "ok", service: "football-intel-api" });
});

/**
 * Countries
 */
app.get("/countries", async (c) => {
  const data = await db.query.countries.findMany();
  return c.json(data);
});

/**
 * Leagues
 */
app.get("/leagues", async (c) => {
  const data = await db.query.leagues.findMany({
    with: { country: true },
  });
  return c.json(data);
});

/**
 * Clubs
 */
app.get("/clubs", async (c) => {
  const data = await db.query.clubs.findMany({
    with: { country: true },
  });
  return c.json(data);
});

/**
 * Teams (by season)
 */
app.get("/teams", async (c) => {
  const seasonId = c.req.query("seasonId");

  const data = await db.query.teams.findMany({
    where: seasonId ? eq(teams.seasonId, seasonId) : undefined,
    with: {
      club: true,
      season: true,
    },
  });

  return c.json(data);
});

/**
 * Players
 */
app.get("/players", async (c) => {
  const data = await db.query.players.findMany();
  return c.json(data);
});

/**
 * Matches
 */
app.get("/matches", async (c) => {
  const data = await db.query.matches.findMany({
    with: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: (m, { desc }) => [desc(m.matchDate)],
  });

  return c.json(data);
});

/**
 * League standings
 */
app.get("/standings", async (c) => {
  const seasonId = c.req.query("seasonId");

  const data = await db.query.leagueStandings.findMany({
    where: seasonId ? eq(leagueStandings.seasonId, seasonId) : undefined,
    with: {
      team: {
        with: { club: true },
      },
    },
    orderBy: (s, { desc }) => [desc(s.points), desc(s.goalDifference)],
  });

  return c.json(data);
});

app.use("/graphql", async (c) => {
  return yoga.fetch(c.req.raw, c);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
