import { db } from "@football-intel/db/src/client";
import {
  matches,
  matchEvents,
  playerSeasonStats,
  playerContracts
} from "@football-intel/db/src/schema/core";
import { eq, and } from "drizzle-orm";

async function computeStats() {
  console.log("Computing player season stats...");

  const finishedMatches = await db.query.matches.findMany({
    where: eq(matches.status, "finished")
  });

  for (const match of finishedMatches) {
    const contracts = await db.query.playerContracts.findMany({
      where: and(
        eq(playerContracts.teamId, match.homeTeamId),
        eq(playerContracts.isCurrent, true)
      )
    });

    const awayContracts = await db.query.playerContracts.findMany({
      where: and(
        eq(playerContracts.teamId, match.awayTeamId),
        eq(playerContracts.isCurrent, true)
      )
    });

    const allContracts = [...contracts, ...awayContracts];

    for (const c of allContracts) {
      const goals = await db.query.matchEvents.findMany({
        where: and(
          eq(matchEvents.matchId, match.id),
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
            appearances: 1,
            goals: goals.length,
            minutesPlayed: 90,
            lastComputedAt: new Date()
          }
        });
    }
  }

  console.log("Stats computation complete");
}

computeStats()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
