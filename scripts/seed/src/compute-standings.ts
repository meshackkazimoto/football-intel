import { db } from "@football-intel/db/src/client";
import {
  matches,
  leagueStandings,
} from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";

async function computeStandings() {
  console.log("Computing league standings...");

  const finishedMatches = await db.query.matches.findMany({
    where: eq(matches.status, "finished")
  });

  const table = new Map<
    string,
    {
      seasonId: string;
      teamId: string;
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      points: number;
    }
  >();

  function getRow(seasonId: string, teamId: string) {
    const key = `${seasonId}:${teamId}`;
    if (!table.has(key)) {
      table.set(key, {
        seasonId,
        teamId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0
      });
    }
    return table.get(key)!;
  }

  for (const match of finishedMatches) {
    if (
      match.homeScore === null ||
      match.awayScore === null
    ) continue;

    const home = getRow(match.seasonId, match.homeTeamId);
    const away = getRow(match.seasonId, match.awayTeamId);

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;

    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const rowsBySeason = new Map<string, Array<(typeof table extends Map<any, infer V> ? V : never)>>();

  for (const row of table.values()) {
    const seasonRows = rowsBySeason.get(row.seasonId) ?? [];
    seasonRows.push(row);
    rowsBySeason.set(row.seasonId, seasonRows);
  }

  for (const seasonRows of rowsBySeason.values()) {
    seasonRows.sort((a, b) => {
      const pointsDiff = b.points - a.points;
      if (pointsDiff !== 0) return pointsDiff;

      const goalDifferenceDiff =
        (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
      if (goalDifferenceDiff !== 0) return goalDifferenceDiff;

      const goalsForDiff = b.goalsFor - a.goalsFor;
      if (goalsForDiff !== 0) return goalsForDiff;

      return a.teamId.localeCompare(b.teamId);
    });

    for (const [index, row] of seasonRows.entries()) {
      const goalDifference = row.goalsFor - row.goalsAgainst;
      const lastComputedAt = new Date();

      await db
        .insert(leagueStandings)
        .values({
          ...row,
          position: index + 1,
          goalDifference,
          lastComputedAt
        })
        .onConflictDoUpdate({
          target: [
            leagueStandings.seasonId,
            leagueStandings.teamId
          ],
          set: {
            position: index + 1,
            played: row.played,
            wins: row.wins,
            draws: row.draws,
            losses: row.losses,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDifference,
            points: row.points,
            lastComputedAt
          }
        });
    }
  }

  console.log("League standings computed");
}

computeStandings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
