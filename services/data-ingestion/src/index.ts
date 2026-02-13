import { runLocalLeagueScraper } from "./sources/local-league";
import { scrapeLigiKuuClubs, scrapeLigiKuuFixtures } from "./sources/ligikuu";
import { logger } from "@football-intel/logger";

function isScrapingEnabled(): boolean {
  const value = process.env.ENABLE_SCRAPING;
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

async function runScrapers() {
  if (!isScrapingEnabled()) {
    logger.warn("Scraping is disabled. Skipping scraper run.");
    return;
  }

  logger.info("Starting scheduled scraper run...");
  try {
    // Run generic local league scraper
    await runLocalLeagueScraper();

    // Run specific Tanzanian scrapers (Authority building)
    await scrapeLigiKuuClubs();
    await scrapeLigiKuuFixtures();

    logger.info("Scraper run completed successfully");
  } catch (error) {
    logger.error({ error }, "Error during scheduled scraper run");
  }
}

logger.info("Data ingestion service started...");

// Run immediately on start
runScrapers();

// Schedule for every 60 minutes (1 hour) for now to be respectful
const ONE_HOUR = 1000 * 60 * 60;
setInterval(runScrapers, ONE_HOUR);
