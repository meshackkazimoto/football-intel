import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { matches, matchLineups, teams, players } from "@football-intel/db/src/schema/core";
import { eq, and } from "drizzle-orm";
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
  const playerIds = lineupPlayers.map((p) => p.playerId);

  const existingPlayers = await db.query.players.findMany({
    where: eq(players.id, playerIds[0]), // will validate below
  });

  if (existingPlayers.length === 0) {
    return c.json({ error: "Invalid players provided" }, 400);
  }

  // 4. Remove existing lineup for this match + team
  await db
    .delete(matchLineups)
    .where(
      and(
        eq(matchLineups.matchId, matchId),
        eq(matchLineups.teamId, teamId),
      ),
    );

  // 5. Insert lineup
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