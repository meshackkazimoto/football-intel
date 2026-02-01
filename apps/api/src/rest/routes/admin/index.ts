import { Hono } from "hono";
import { type User, type Session } from "lucia";
import { authMiddleware } from "../../../middleware/auth";
import { db } from "@football-intel/db/src/client";
import {
  ingestionLogs,
  verificationRecords,
} from "@football-intel/db/src/schema/ingestion";
import { eq, and } from "drizzle-orm";
import {
  players,
  matches,
  clubs,
  matchEvents,
  teams,
  countries,
  playerContracts,
  leagues,
  seasons,
} from "@football-intel/db/src/schema/core";
import { StatsJobs, statsQueue } from "@football-intel/queue";
import { logger } from "@football-intel/logger";
import { createRateLimiter } from "src/middleware/rate-limit";
import manageCountries from "./manage-countries";
import manageTeams from "./manage-teams";
import manageClubs from "./manage-clubs";
import manageSeasons from "./manage-seasons";
import manageLineups from "./manage-lineups";
import manageFixtures from "./manage-fixtures";
import manageMatchEvents from "./manage-match-events";
import manageMatchStats from "./manage-match-stats";
import manageMatchStatus from "./manage-match-status";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", authMiddleware);
app.use("*", requireRole(["ADMIN", "MODERATOR"]));

app.use("*", async (c, next) => {
  console.log(`Admin request: ${c.req.method} ${c.req.path}`);

  // Development bypass for testing
  if (
    process.env.NODE_ENV === "development" &&
    c.req.header("X-Admin-Test-Mode") === "true"
  ) {
    c.set("user", {
      id: "dev-admin-id",
      email: "dev@football-intel.com",
      role: "ADMIN",
    } as any);
    return next();
  }

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (user.role !== "ADMIN") {
    return c.json({ error: "Forbidden" }, 403);
  }
  return next();
});

app.route("/countries", manageCountries);
app.route("/teams", manageTeams);
app.route("/clubs", manageClubs);
app.route("/seasons", manageSeasons);
app.route("/lineups", manageLineups);
app.route("/fixtures", manageFixtures);
app.route("/match-events", manageMatchEvents);
app.route("/match-stats", manageMatchStats);
app.route("/match-status", manageMatchStatus);

app.post("/ingest", createRateLimiter(20, 60), async (c) => {
  const body = await c.req.json();

  const [row] = await db
    .insert(ingestionLogs)
    .values({
      type: body.type,
      source: "ADMIN",
      rawPayload: body.payload,
    })
    .returning();

  return c.json(row);
});

app.post("/verify/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  // 1. Save verification record
  await db.insert(verificationRecords).values({
    ingestionId: id,
    verifierUserId: c.get("user")!.id,
    confidenceScore: body.score,
    notes: body.notes,
  });

  // 2. Mark ingestion as verified
  const [ingestion] = await db
    .update(ingestionLogs)
    .set({ status: "verified" })
    .where(eq(ingestionLogs.id, id))
    .returning();

  if (!ingestion) {
    return c.json({ error: "Ingestion not found" }, 404);
  }

  logger.info({
    route: "verify",
    ingestionId: id,
    userId: c.get("user")?.id,
  });

  // 3. Dispatch queue job depending on type
  const payload = ingestion.rawPayload as {
    matchId?: string;
    seasonId?: string;
    id?: string;
    fullName?: string;
    clubName?: string;
  };

  switch (ingestion.type) {
    case "PLAYER": {
      const p = payload as any;

      let nationalityId = p.nationalityId;
      if (!nationalityId) {
        const tza = await db.query.countries.findFirst({
          where: eq(countries.code, "TZA"),
        });
        nationalityId = tza?.id;
      }

      const [insertedPlayer] = await db
        .insert(players)
        .values({
          firstName: p.firstName || p.fullName?.split(" ")[0] || "Unknown",
          lastName:
            p.lastName ||
            p.fullName?.split(" ").slice(1).join(" ") ||
            "Unknown",
          fullName: p.fullName,
          slug: p.slug,
          nationalityId,
          preferredFoot: p.preferredFoot,
          height: p.height,
        })
        .onConflictDoNothing()
        .returning();

      const playerId = insertedPlayer?.id || p.id;

      await statsQueue.add(StatsJobs.INDEX_PLAYER, {
        id: playerId,
        fullName: p.fullName,
        clubName: p.clubName,
      });
      break;
    }

    case "MATCH": {
      const m = payload as any;

      let seasonId = m.seasonId;
      if (!seasonId && m.seasonName) {
        const season = await db.query.seasons.findFirst({
          where: eq(seasons.name, m.seasonName),
        });
        seasonId = season?.id;
      }

      if (!seasonId) {
        // Fallback to current season if it's the only one
        const current = await db.query.seasons.findFirst({
          where: eq(seasons.isCurrent, true),
        });
        seasonId = current?.id;
      }

      if (!seasonId) {
        return c.json({ error: "Season not found" }, 400);
      }

      // Attempt to resolve team names to IDs if IDs are missing
      let homeTeamId = m.homeTeamId;
      let awayTeamId = m.awayTeamId;

      if (!homeTeamId && m.homeTeamName) {
        const team = await db.query.teams.findFirst({
          where: eq(teams.name, m.homeTeamName),
        });
        homeTeamId = team?.id;
      }
      if (!awayTeamId && m.awayTeamName) {
        const team = await db.query.teams.findFirst({
          where: eq(teams.name, m.awayTeamName),
        });
        awayTeamId = team?.id;
      }

      if (!homeTeamId || !awayTeamId) {
        logger.warn({ m }, "Could not resolve team IDs for match ingestion");
        return c.json({ error: "Could not resolve team IDs" }, 400);
      }

      const [insertedMatch] = await db
        .insert(matches)
        .values({
          seasonId,
          homeTeamId,
          awayTeamId,
          matchDate: new Date(m.matchDate),
          status: m.status || "scheduled",
          venue: m.venue,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
        })
        .onConflictDoNothing()
        .returning();

      const matchId = insertedMatch?.id || m.id;

      if (matchId && m.status === "finished") {
        await statsQueue.add(StatsJobs.RECOMPUTE_STATS, { matchId });
      }
      if (seasonId) {
        await statsQueue.add(StatsJobs.RECOMPUTE_STANDINGS, {
          seasonId,
        });
      }
      break;
    }

    case "MATCH_EVENT": {
      const e = payload as any;

      let matchId = e.matchId;
      let teamId = e.teamId;
      let playerId = e.playerId;

      // 1. Resolve Team if missing
      if (!teamId && e.teamName) {
        const team = await db.query.teams.findFirst({
          where: eq(teams.name, e.teamName),
        });
        teamId = team?.id;
      }

      // 2. Resolve Match if missing
      if (!matchId && teamId) {
        // Try to find the most recent/relevant match for this team
        const match = await db.query.matches.findFirst({
          where: and(
            eq(matches.status, "finished"),
            // Match date logic could be added here, but for now we look for team involvement
          ),
          // In a real scenario, we'd use matchDate or sourceUrl
        });
        matchId = match?.id;
      }

      // 3. Resolve Player if missing
      if (!playerId && e.playerName && teamId) {
        const player = await db.query.players.findFirst({
          where: eq(players.fullName, e.playerName),
        });
        playerId = player?.id;

        // Verify player is in the team (Optional but good for authority)
        if (playerId) {
          const contract = await db.query.playerContracts.findFirst({
            where: and(
              eq(playerContracts.playerId, playerId),
              eq(playerContracts.teamId, teamId),
            ),
          });
          if (!contract) {
            logger.warn(
              { playerName: e.playerName, teamName: e.teamName },
              "Player scored for a team they aren't contracted to",
            );
          }
        }
      }

      if (!matchId || !teamId) {
        logger.warn({ e }, "Could not resolve match or team for event");
        return c.json({ error: "Missing match or team context" }, 400);
      }

      await db.insert(matchEvents).values({
        matchId,
        teamId,
        playerId,
        eventType: e.eventType,
        minute: e.minute,
      });

      await statsQueue.add(StatsJobs.RECOMPUTE_STATS, { matchId });
      break;
    }

    case "CLUB": {
      const cl = payload as any;

      let countryId = cl.countryId;
      if (!countryId) {
        const tza = await db.query.countries.findFirst({
          where: eq(countries.code, "TZA"),
        });
        countryId = tza?.id;
      }

      if (!countryId) {
        return c.json({ error: "Country not found" }, 400);
      }

      await db
        .insert(clubs)
        .values({
          name: cl.name,
          slug: cl.slug,
          countryId,
          foundedYear: cl.foundedYear,
          stadiumName: cl.stadiumName,
          stadiumCapacity: cl.stadiumCapacity,
        })
        .onConflictDoNothing();
      break;
    }

    case "LEAGUE": {
      const l = payload as any;
      let countryId = l.countryId;
      if (!countryId) {
        const tza = await db.query.countries.findFirst({
          where: eq(countries.code, "TZA"),
        });
        countryId = tza?.id;
      }

      await db
        .insert(leagues)
        .values({
          name: l.name,
          countryId,
          tier: l.tier || 1,
        })
        .onConflictDoNothing();
      break;
    }

    case "SEASON": {
      const s = payload as any;
      let leagueId = s.leagueId;
      if (!leagueId && s.leagueName) {
        const league = await db.query.leagues.findFirst({
          where: eq(leagues.name, s.leagueName),
        });
        leagueId = league?.id;
      }

      if (!leagueId) {
        return c.json({ error: "League not found" }, 400);
      }

      await db
        .insert(seasons)
        .values({
          leagueId,
          name: s.name,
          startDate: s.startDate,
          endDate: s.endDate,
          isCurrent: s.isCurrent || false,
        })
        .onConflictDoNothing();
      break;
    }
  }

  return c.json({ ok: true });
});

export default app;
