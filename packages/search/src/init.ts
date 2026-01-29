import { typesense } from "./client";
import { playerCollection } from "./schema";
import { logger } from "@football-intel/logger";

await typesense.collections().create(playerCollection as any);
logger.info("Players collection created");
