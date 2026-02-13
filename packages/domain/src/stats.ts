import { db } from "@football-intel/db/src/client";
import {
  matches,
  matchEvents,
  matchPossessions,
  playerContracts,
  playerSeasonStats,
  matchStats,
} from "@football-intel/db/src/schema/core";
import { and, eq, sql } from "drizzle-orm";

function getMatchReferenceSecond(match: {
  currentMinute: number | null;
  startedAt: Date | null;
  endedAt: Date | null;
}) {
  const minuteBased = Math.max(0, (match.currentMinute ?? 0) * 60);

  if (!match.startedAt) {
    return minuteBased;
  }

  const end = match.endedAt ?? new Date();
  const elapsed = Math.max(
    0,
    Math.floor((end.getTime() - match.startedAt.getTime()) / 1000),
  );

  if (match.currentMinute !== null) {
    const upperBound = minuteBased + 59;
    return Math.min(Math.max(minuteBased, elapsed), upperBound);
  }

  return Math.max(minuteBased, elapsed);
}

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
  const referenceSecond = getMatchReferenceSecond(match);

  const possessionRows = await db.query.matchPossessions.findMany({
    where: eq(matchPossessions.matchId, matchId),
  });

  const possessionSecondsByTeam = new Map<string, number>();
  for (const row of possessionRows) {
    const end = row.endSecond ?? referenceSecond;
    const duration = Math.max(0, end - row.startSecond);
    possessionSecondsByTeam.set(
      row.teamId,
      (possessionSecondsByTeam.get(row.teamId) ?? 0) + duration,
    );
  }

  const homeSeconds = possessionSecondsByTeam.get(match.homeTeamId) ?? 0;
  const awaySeconds = possessionSecondsByTeam.get(match.awayTeamId) ?? 0;
  const totalPossessionSeconds = homeSeconds + awaySeconds;
  const homePossession =
    totalPossessionSeconds > 0
      ? Math.round((homeSeconds / totalPossessionSeconds) * 100)
      : 50;
  const awayPossession = totalPossessionSeconds > 0 ? 100 - homePossession : 50;

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

    const possession =
      teamId === match.homeTeamId ? homePossession : awayPossession;

    await db
      .insert(matchStats)
      .values({
        matchId,
        teamId,
        possession,
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
          possession,
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
