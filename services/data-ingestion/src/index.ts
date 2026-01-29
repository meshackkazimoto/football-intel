import { runLocalLeagueScraper } from "./sources/local-league";
import { logger } from "@football-intel/logger";

async function runScrapers() {
  logger.info("Starting scheduled scraper run...");
  try {
    await runLocalLeagueScraper();
    // Add more scrapers here as they are developed
  } catch (error) {
    logger.error({ error }, "Error during scheduled scraper run");
  }
}

logger.info("Data ingestion service started...");

// Run immediately on start
runScrapers();

// Schedule for every 30 minutes
const THIRTY_MINUTES = 1000 * 60 * 0.5;
setInterval(runScrapers, THIRTY_MINUTES);
