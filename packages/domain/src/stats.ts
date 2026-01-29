import { db } from "@football-intel/db/src/client";
import {
  matches,
  matchEvents,
  playerContracts,
  playerSeasonStats,
  matchStats,
} from "@football-intel/db/src/schema/core";
import { and, eq, sql } from "drizzle-orm";

export async function recomputePlayerStats(matchId: string) {
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match) return;

  const teamsIds = [match.homeTeamId, match.awayTeamId];

  for (const teamId of teamsIds) {
    const playersInMatch = await db.query.matchEvents.findMany({
      where: and(
        eq(matchEvents.matchId, matchId),
        eq(matchEvents.teamId, teamId),
      ),
      columns: {
        playerId: true,
      },
    });

    // Get unique player IDs from events
    const uniquePlayerIds = [
      ...new Set(
        playersInMatch.map((p) => p.playerId).filter((id) => id !== null),
      ),
    ] as string[];

    for (const playerId of uniquePlayerIds) {
      // Aggregate stats for this player in this season
      const seasonStats = await db
        .select({
          goals: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'goal')`,
          assists: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'assist')`,
          yellowCards: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'yellow_card')`,
          redCards: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'red_card')`,
          shots: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'shot')`,
        })
        .from(matchEvents)
        .innerJoin(matches, eq(matchEvents.matchId, matches.id))
        .where(
          and(
            eq(matchEvents.playerId, playerId),
            eq(matches.seasonId, match.seasonId),
            eq(matchEvents.teamId, teamId),
          ),
        );

      const stats = seasonStats[0];

      // Count appearances (distinct match IDs where player had an event or was in lineup)
      // For simplicity, we count matches where they have at least one event
      const appearancesResult = await db
        .select({ count: sql<number>`count(distinct ${matchEvents.matchId})` })
        .from(matchEvents)
        .innerJoin(matches, eq(matchEvents.matchId, matches.id))
        .where(
          and(
            eq(matchEvents.playerId, playerId),
            eq(matches.seasonId, match.seasonId),
          ),
        );

      await db
        .insert(playerSeasonStats)
        .values({
          playerId,
          teamId,
          seasonId: match.seasonId,
          appearances: appearancesResult[0].count,
          goals: Number(stats.goals) || 0,
          assists: Number(stats.assists) || 0,
          yellowCards: Number(stats.yellowCards) || 0,
          redCards: Number(stats.redCards) || 0,
          shots: Number(stats.shots) || 0,
          minutesPlayed: appearancesResult[0].count * 90, // Placeholder
          passAccuracy: 80, // Placeholder
        })
        .onConflictDoUpdate({
          target: [
            playerSeasonStats.playerId,
            playerSeasonStats.seasonId,
            playerSeasonStats.teamId,
          ],
          set: {
            appearances: appearancesResult[0].count,
            goals: Number(stats.goals) || 0,
            assists: Number(stats.assists) || 0,
            yellowCards: Number(stats.yellowCards) || 0,
            redCards: Number(stats.redCards) || 0,
            shots: Number(stats.shots) || 0,
            minutesPlayed: appearancesResult[0].count * 90,
            lastComputedAt: new Date(),
          },
        });
    }
  }
}

export async function computeMatchStats(matchId: string) {
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match) return;

  const teamIds = [match.homeTeamId, match.awayTeamId];

  for (const teamId of teamIds) {
    const aggregated = await db
      .select({
        shotsOnTarget: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'shot_on_target')`,
        shotsOffTarget: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'shot_off_target')`,
        corners: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'corner')`,
        fouls: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'foul')`,
        yellowCards: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'yellow_card')`,
        redCards: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'red_card')`,
        saves: sql<number>`count(*) filter (where ${matchEvents.eventType} = 'save')`,
      })
      .from(matchEvents)
      .where(
        and(eq(matchEvents.matchId, matchId), eq(matchEvents.teamId, teamId)),
      );

    const s = aggregated[0];

    await db
      .insert(matchStats)
      .values({
        matchId,
        teamId,
        possession: 50, // Placeholder
        shotsOnTarget: Number(s.shotsOnTarget) || 0,
        shotsOffTarget: Number(s.shotsOffTarget) || 0,
        corners: Number(s.corners) || 0,
        fouls: Number(s.fouls) || 0,
        yellowCards: Number(s.yellowCards) || 0,
        redCards: Number(s.redCards) || 0,
        saves: Number(s.saves) || 0,
        passAccuracy: 80, // Placeholder
      })
      .onConflictDoUpdate({
        target: [matchStats.matchId, matchStats.teamId],
        set: {
          shotsOnTarget: Number(s.shotsOnTarget) || 0,
          shotsOffTarget: Number(s.shotsOffTarget) || 0,
          corners: Number(s.corners) || 0,
          fouls: Number(s.fouls) || 0,
          yellowCards: Number(s.yellowCards) || 0,
          redCards: Number(s.redCards) || 0,
          saves: Number(s.saves) || 0,
        },
      });
  }
}
