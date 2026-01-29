import { logger } from "@football-intel/logger";
import { typesense } from "./client";
import { db } from "@football-intel/db/src/client";
import { players } from "@football-intel/db/src/schema/core";

async function reindexPlayers() {
  const allPlayers = await db.select().from(players);

  for (const p of allPlayers) {
    await typesense.collections("players").documents().upsert({
      id: p.id,
      fullName: p.fullName,
      clubName: "",
    });

    logger.info(`Indexed: ${p.fullName}`);
  }
}

reindexPlayers();
