import { db } from "@football-intel/db/src/client";
import { teams, clubs, seasons, leagues } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { typesense } from "./client";
import { logger } from "@football-intel/logger";

async function reindexTeams() {
  const rows = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      clubId: clubs.id,
      clubName: clubs.name,
      seasonId: seasons.id,
      seasonName: seasons.name,
      leagueId: leagues.id,
      leagueName: leagues.name,
      countryId: leagues.countryId,
    })
    .from(teams)
    .innerJoin(clubs, eq(clubs.id, teams.clubId))
    .innerJoin(seasons, eq(seasons.id, teams.seasonId))
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId));

  for (const t of rows) {
    await typesense.collections("teams").documents().upsert({
      id: t.teamId,
      name: t.teamName,
      clubId: t.clubId,
      clubName: t.clubName,
      seasonId: t.seasonId,
      seasonName: t.seasonName,
      leagueId: t.leagueId,
      leagueName: t.leagueName,
      countryId: t.countryId,
    });

    logger.info(`Indexed team: ${t.teamName} (${t.seasonName})`);
  }

  logger.info("Team reindexing complete");
}

await reindexTeams();