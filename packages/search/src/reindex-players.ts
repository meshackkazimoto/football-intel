import { db } from "@football-intel/db/src/client";
import {
  players,
  playerContracts,
  teams,
  clubs,
  seasons,
  leagues,
} from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { typesense } from "./client";
import { logger } from "@football-intel/logger";

async function reindexPlayers() {
  const rows = await db
    .select({
      playerId: players.id,
      fullName: players.fullName,
      position: playerContracts.position,
      teamId: teams.id,
      teamName: teams.name,
      clubId: clubs.id,
      clubName: clubs.name,
      leagueId: leagues.id,
      leagueName: leagues.name,
      seasonId: seasons.id,
    })
    .from(players)
    .leftJoin(
      playerContracts,
      eq(playerContracts.playerId, players.id),
    )
    .leftJoin(teams, eq(teams.id, playerContracts.teamId))
    .leftJoin(clubs, eq(clubs.id, teams.clubId))
    .leftJoin(seasons, eq(seasons.id, teams.seasonId))
    .leftJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(eq(playerContracts.isCurrent, true));

  for (const p of rows) {
    await typesense.collections("players").documents().upsert({
      id: p.playerId,
      fullName: p.fullName,
      position: p.position ?? null,
      teamId: p.teamId ?? null,
      teamName: p.teamName ?? null,
      clubId: p.clubId ?? null,
      clubName: p.clubName ?? null,
      leagueId: p.leagueId ?? null,
      leagueName: p.leagueName ?? null,
      seasonId: p.seasonId ?? null,
    });

    logger.info(`Indexed player: ${p.fullName}`);
  }
}

reindexPlayers().then(() => {
  logger.info("Player reindexing complete");
  process.exit(0);
});