import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "@football-intel/logger";
import { sendToIngestion } from "../utils/http";
import type { ScrapedMatch } from "../types";

export async function runLocalLeagueScraper() {
  try {
    logger.info("Fetching fixtures from local league source...");
    const res = await axios.get("https://www.flashscoresss.com", {
      timeout: 10000, // 10s timeout
    });

    const $ = cheerio.load(res.data);
    const matches: ScrapedMatch[] = [];

    $(".match-row").each((_, el) => {
      const home = $(el).find(".home").text().trim();
      const away = $(el).find(".away").text().trim();
      const dateStr = $(el).find(".date").text().trim();

      if (home && away && dateStr) {
        matches.push({
          homeTeamName: home,
          awayTeamName: away,
          matchDate: new Date(dateStr),
        });
      }
    });

    logger.info(`Found ${matches.length} matches to ingest`);

    for (const m of matches) {
      await sendToIngestion({
        type: "MATCH",
        payload: m,
      });
    }
  } catch (error) {
    logger.error({ error }, "Error running local league scraper");
  }
}
