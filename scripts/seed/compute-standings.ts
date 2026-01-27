import { db } from "@football-intel/db/src/client";
import {
  matches,
  leagueStandings,
  teams
} from "@football-intel/db/src/schema/core";
import { eq, and } from "drizzle-orm";

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

  for (const row of table.values()) {
    await db
      .insert(leagueStandings)
      .values({
        ...row,
        goalDifference: row.goalsFor - row.goalsAgainst,
        lastComputedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [
          leagueStandings.seasonId,
          leagueStandings.teamId
        ],
        set: {
          played: row.played,
          wins: row.wins,
          draws: row.draws,
          losses: row.losses,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDifference: row.goalsFor - row.goalsAgainst,
          points: row.points,
          lastComputedAt: new Date()
        }
      });
  }

  console.log("League standings computed");
}

computeStandings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
