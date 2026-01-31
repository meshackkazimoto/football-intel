import { typesense } from "./client";
import { playerCollection, teamCollection } from "./schema";
import { logger } from "@football-intel/logger";

export async function initTypesense() {
  async function ensureCollection(schema: any) {
    try {
      await typesense.collections(schema.name).retrieve();
      logger.info(`Collection exists: ${schema.name}`);
    } catch (err: any) {
      if (err?.httpStatus === 404) {
        await typesense.collections().create(schema);
        logger.info(`Collection created: ${schema.name}`);
      } else {
        throw err;
      }
    }
  }

  await ensureCollection(playerCollection);
  await ensureCollection(teamCollection);
}