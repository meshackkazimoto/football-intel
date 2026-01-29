import { db } from "@football-intel/db/src/client";
import { matches, matchEvents, playerContracts, playerSeasonStats } from "@football-intel/db/src/schema/core";
import { and, eq } from "drizzle-orm";

export async function recomputePlayerStats(matchId: string) {
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId)
  });

  if (!match) return;

  const contracts = await db.query.playerContracts.findMany({
    where: eq(playerContracts.teamId, match.homeTeamId)
  })

  for (const c of contracts) {
    const goals = await db.query.matchEvents.findMany({
      where: and(
        eq(matchEvents.matchId, matchId),
        eq(matchEvents.playerId, c.playerId),
        eq(matchEvents.eventType, "goal")
      )
    });

    await db
      .insert(playerSeasonStats)
      .values({
        playerId: c.playerId,
        teamId: c.teamId,
        seasonId: match.seasonId,
        appearances: 1,
        goals: goals.length,
        minutesPlayed: 90
      })
      .onConflictDoUpdate({
        target: [
          playerSeasonStats.playerId,
          playerSeasonStats.seasonId,
          playerSeasonStats.teamId
        ],
        set: {
          goals: goals.length,
          appearances: 1,
          minutesPlayed: 90
        }
    });
  }
}
