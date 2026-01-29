import { db } from "@football-intel/db/src/client";
import { matches, leagueStandings } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";

export async function recomputeStandings(seasonId: string) {
  const seasonMatches = await db.query.matches.findMany({
    where: eq(matches.seasonId, seasonId),
  });

  const stats = new Map<
    string,
    {
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }
  >();

  for (const m of seasonMatches) {
    if (m.status !== "finished") continue;
    if (m.homeScore === null || m.awayScore === null) continue;

    const home = stats.get(m.homeTeamId) || {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };
    const away = stats.get(m.awayTeamId) || {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    };

    home.played++;
    away.played++;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.wins++;
      home.points += 3;
      away.losses++;
    } else if (m.homeScore < m.awayScore) {
      away.wins++;
      away.points += 3;
      home.losses++;
    } else {
      home.draws++;
      home.points += 1;
      away.draws++;
      away.points += 1;
    }

    stats.set(m.homeTeamId, home);
    stats.set(m.awayTeamId, away);
  }

  for (const [teamId, teamStats] of stats) {
    await db
      .insert(leagueStandings)
      .values({
        id: crypto.randomUUID(),
        seasonId,
        teamId,
        played: teamStats.played,
        wins: teamStats.wins,
        draws: teamStats.draws,
        losses: teamStats.losses,
        goalsFor: teamStats.goalsFor,
        goalsAgainst: teamStats.goalsAgainst,
        goalDifference: teamStats.goalsFor - teamStats.goalsAgainst,
        points: teamStats.points,
      })
      .onConflictDoUpdate({
        target: [leagueStandings.seasonId, leagueStandings.teamId],
        set: {
          played: teamStats.played,
          wins: teamStats.wins,
          draws: teamStats.draws,
          losses: teamStats.losses,
          goalsFor: teamStats.goalsFor,
          goalsAgainst: teamStats.goalsAgainst,
          goalDifference: teamStats.goalsFor - teamStats.goalsAgainst,
          points: teamStats.points,
          lastComputedAt: new Date(),
        },
      });
  }
}
