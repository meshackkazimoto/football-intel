import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { matches, matchLineups, players, playerContracts } from "@football-intel/db/src/schema/core";
import { eq, and, inArray, gte, lte, isNull, or } from "drizzle-orm";
import { CreateLineupSchema } from "@football-intel/validation";
import { logger } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]));

app.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = CreateLineupSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { matchId, teamId, players: lineupPlayers } = parsed.data;
  const playerIds = lineupPlayers.map((p) => p.playerId);
  const uniquePlayerIds = new Set(playerIds);
  const starterCount = lineupPlayers.filter((p) => p.isStarting).length;
  const jerseyNumbers = lineupPlayers
    .map((p) => p.jerseyNumber)
    .filter((n): n is number => typeof n === "number");
  const uniqueJerseyNumbers = new Set(jerseyNumbers);

  if (uniquePlayerIds.size !== playerIds.length) {
    return c.json({ error: "Duplicate playerId in lineup" }, 400);
  }

  if (starterCount !== 11) {
    return c.json({ error: "Lineup must have exactly 11 starters" }, 400);
  }

  if (uniqueJerseyNumbers.size !== jerseyNumbers.length) {
    return c.json({ error: "Duplicate jersey numbers in lineup" }, 400);
  }

  // 1. Validate match exists
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match) {
    return c.json({ error: "Match not found" }, 404);
  }

  // Prevent editing after match start
  if (match.status !== "scheduled") {
    return c.json(
      { error: "Lineups can only be updated before kickoff" },
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

  // 3. Validate players exist
  const existingPlayers = await db.query.players.findMany({
    where: inArray(players.id, playerIds),
  });

  if (existingPlayers.length !== playerIds.length) {
    return c.json({ error: "Invalid players provided" }, 400);
  }

  // 4. Validate players are contracted to this team on match date
  const matchDate = match.matchDate.toISOString().slice(0, 10);
  const validContracts = await db.query.playerContracts.findMany({
    where: and(
      eq(playerContracts.teamId, teamId),
      inArray(playerContracts.playerId, playerIds),
      lte(playerContracts.startDate, matchDate),
      or(
        isNull(playerContracts.endDate),
        gte(playerContracts.endDate, matchDate),
      ),
    ),
  });

  const eligiblePlayerIds = new Set(validContracts.map((c) => c.playerId));
  const invalidPlayerId = playerIds.find((id) => !eligiblePlayerIds.has(id));
  if (invalidPlayerId) {
    return c.json(
      {
        error: "Lineup includes players not assigned to this team at match date",
        playerId: invalidPlayerId,
      },
      409,
    );
  }

  // 5. Remove existing lineup for this match + team
  await db
    .delete(matchLineups)
    .where(
      and(
        eq(matchLineups.matchId, matchId),
        eq(matchLineups.teamId, teamId),
      ),
    );

  // 6. Insert lineup
  await db.insert(matchLineups).values(
    lineupPlayers.map((p) => ({
      matchId,
      teamId,
      playerId: p.playerId,
      position: p.position,
      isStarting: p.isStarting,
      jerseyNumber: p.jerseyNumber,
    })),
  );

  logger.info({
    matchId,
    teamId,
    count: lineupPlayers.length,
    admin: c.get("user")?.id,
  }, "Match lineup saved");

  return c.json({ ok: true });
});

export default app;
