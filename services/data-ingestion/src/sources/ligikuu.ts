import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "@football-intel/logger";
import { sendToIngestion } from "../utils/http";

const BASE_URL = "https://ligikuuuuu.co.tz";

export async function scrapeLigiKuuClubs() {
  try {
    logger.info("Scraping clubs from Ligi Kuu...");
    const url = `${BASE_URL}/nbc-premier-league/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const clubs: any[] = [];

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
    const url = `${BASE_URL}/nbc-premier-league/`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    const matches: any[] = [];

    $("table.sp-event-blocks tr").each((_, el) => {
      const dateStr = $(el).find(".sp-event-date").text().trim();
      const teams = $(el).find(".sp-event-teams a");
      const home = $(teams[0]).text().trim();
      const away = $(teams[1]).text().trim();
      const resultLink = $(el).find(".sp-event-results a").attr("href");
      const scoreRaw = $(el).find(".sp-event-results").text().trim();

      if (home && away) {
        const matchData = {
          homeTeamName: home,
          awayTeamName: away,
          matchDate: dateStr ? new Date(dateStr) : new Date(),
          score: scoreRaw,
          status: scoreRaw.includes(":") ? "scheduled" : "finished",
          sourceUrl: resultLink,
        };
        matches.push(matchData);
      }
    });

    logger.info(`Found ${matches.length} fixtures from Ligi Kuu`);

    for (const m of matches) {
      await sendToIngestion({
        type: "MATCH",
        payload: m,
      });

      // If match is finished and has a detail link, scrape events
      if (m.status === "finished" && m.sourceUrl) {
        await scrapeLigiKuuMatchDetails(m.sourceUrl, m);
      }
    }
  } catch (error) {
    logger.error({ error }, "Error scraping Ligi Kuu fixtures");
  }
}

async function scrapeLigiKuuMatchDetails(url: string, matchSummary: any) {
  try {
    logger.info(`Scraping match details from: ${url}`);
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);

    // Look for goals in performance tables
    // SportsPesa often has one performance table per team
    $(".sp-template-event-performance").each((i, table) => {
      const teamName =
        i === 0 ? matchSummary.homeTeamName : matchSummary.awayTeamName;

      $(table)
        .find("tbody tr")
        .each((_, row) => {
          const playerName = $(row).find(".data-name").text().trim();
          const goals = $(row).find(".data-goals").text().trim(); // Might be "1 (45', 78')" or similar

          if (goals && goals !== "0") {
            // Parse minutes if available, e.g., "1 (45')"
            const minuteMatches = goals.match(/\d+/g);
            if (minuteMatches) {
              // Usually the first number is count, following are minutes
              const goalCount = parseInt(minuteMatches[0]);
              const minutes = minuteMatches.slice(1);

              for (let j = 0; j < goalCount; j++) {
                const min = minutes[j];
                sendToIngestion({
                  type: "MATCH_EVENT",
                  payload: {
                    matchSourceUrl: url,
                    teamName,
                    playerName,
                    eventType: "goal",
                    minute: min ? parseInt(min) : 0,
                  },
                });
              }
            }
          }
        });
    });
  } catch (error) {
    logger.error({ error, url }, "Error scraping Ligi Kuu match details");
  }
}
