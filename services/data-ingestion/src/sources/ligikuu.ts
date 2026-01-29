import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "@football-intel/logger";
import { sendToIngestion } from "../utils/http";

const BASE_URL = "https://ligikuu.co.tz";

export async function scrapeLigiKuuClubs() {
  try {
    logger.info("Scraping clubs from Ligi Kuu...");
    const url = `${BASE_URL}/nbc-premier-league/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const clubs: any[] = [];

    // The subagent found table.sp-league-table
    $("table.sp-league-table tbody tr").each((_, el) => {
      const name = $(el).find(".data-name").text().trim();
      const slug = $(el)
        .find(".data-name a")
        .attr("href")
        ?.split("/")
        .filter(Boolean)
        .pop();

      if (name) {
        clubs.push({
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
          sourceUrl: $(el).find(".data-name a").attr("href"),
        });
      }
    });

    logger.info(`Found ${clubs.length} clubs from Ligi Kuu`);

    for (const club of clubs) {
      await sendToIngestion({
        type: "CLUB",
        payload: club,
      });
    }
  } catch (error) {
    logger.error({ error }, "Error scraping Ligi Kuu clubs");
  }
}

export async function scrapeLigiKuuFixtures() {
  try {
    logger.info("Scraping fixtures from Ligi Kuu...");
    // Often fixtures are on the season page or main league page
    const url = `${BASE_URL}/nbc-premier-league/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const matches: any[] = [];

    // The subagent found table.sp-event-blocks
    $("table.sp-event-blocks tr").each((_, el) => {
      const dateStr = $(el).find(".sp-event-date").text().trim();
      const teams = $(el).find(".sp-event-teams a");
      const home = $(teams[0]).text().trim();
      const away = $(teams[1]).text().trim();
      const score = $(el).find(".sp-event-results").text().trim();

      if (home && away) {
        matches.push({
          homeTeamName: home,
          awayTeamName: away,
          matchDate: dateStr ? new Date(dateStr) : new Date(),
          score,
          competition: "NBC Premier League",
          sourceUrl: $(el).find(".sp-event-results a").attr("href"),
        });
      }
    });

    logger.info(`Found ${matches.length} fixtures from Ligi Kuu`);

    for (const m of matches) {
      await sendToIngestion({
        type: "MATCH",
        payload: m,
      });
    }
  } catch (error) {
    logger.error({ error }, "Error scraping Ligi Kuu fixtures");
  }
}
