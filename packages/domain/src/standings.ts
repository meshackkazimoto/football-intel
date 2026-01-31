import { db } from "@football-intel/db/src/client";
import { matches, leagueStandings } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";

type TeamStats = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export async function recomputeStandings(seasonId: string) {
  const seasonMatches = await db.query.matches.findMany({
    where: eq(matches.seasonId, seasonId),
  });

  const stats = new Map<string, TeamStats>();

  for (const m of seasonMatches) {
    if (m.status !== "finished") continue;
    if (m.homeScore === null || m.awayScore === null) continue;

    const home =
      stats.get(m.homeTeamId) ??
      {
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      };

    const away =
      stats.get(m.awayTeamId) ??
      {
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
      away.draws++;
      home.points += 1;
      away.points += 1;
    }

    stats.set(m.homeTeamId, home);
    stats.set(m.awayTeamId, away);
  }

  // Convert map → sortable table
  const table = Array.from(stats.entries()).map(([teamId, s]) => ({
    teamId,
    played: s.played,
    wins: s.wins,
    draws: s.draws,
    losses: s.losses,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalsFor - s.goalsAgainst,
    points: s.points,
  }));

  // Sort by football rules
  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Persist standings
  for (let i = 0; i < table.length; i++) {
    const row = table[i];

    await db
      .insert(leagueStandings)
      .values({
        seasonId,
        teamId: row.teamId,
        position: i + 1,
        played: row.played,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
      })
      .onConflictDoUpdate({
        target: [leagueStandings.seasonId, leagueStandings.teamId],
        set: {
          position: i + 1,
          played: row.played,
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDifference: row.goalDifference,
          points: row.points,
          lastComputedAt: new Date(),
        },
      });
  }
}