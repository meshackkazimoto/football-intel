import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "@football-intel/logger";
import { sendToIngestion } from "./utils/http";

const BASE_URL = "https://ligikuuuuu.co.tz";

const HISTORICAL_SEASONS = [
  {
    name: "2024/2025",
    url: `${BASE_URL}/nbc-premier-league/season-2024-2025/`,
    startDate: "2024-08-01",
    endDate: "2025-06-30",
  },
  {
    name: "2023/2024",
    url: `${BASE_URL}/nbc-premier-league/season-2023-2024/`,
    startDate: "2023-08-01",
    endDate: "2024-06-30",
  },
];

async function backfillHistory() {
  logger.info("Starting historical backfill for Tanzanian Football...");

  // 1. Ensure League exists
  await sendToIngestion({
    type: "LEAGUE",
    payload: {
      name: "NBC Premier League",
      tier: 1,
    },
  });

  for (const season of HISTORICAL_SEASONS) {
    logger.info(`Backfilling season: ${season.name}`);

    // 2. Ensure Season exists
    await sendToIngestion({
      type: "SEASON",
      payload: {
        leagueName: "NBC Premier League",
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
        isCurrent: false,
      },
    });

    try {
      const res = await axios.get(season.url);
      const $ = cheerio.load(res.data);

      // 3. Scrape Clubs for this season
      const clubs: any[] = [];
      $("table.sp-league-table tbody tr").each((_, el) => {
        const name = $(el).find(".data-name").text().trim();
        const clubSlug = $(el)
          .find(".data-name a")
          .attr("href")
          ?.split("/")
          .filter(Boolean)
          .pop();
        if (name) {
          clubs.push({
            name,
            slug: clubSlug || name.toLowerCase().replace(/\s+/g, "-"),
          });
        }
      });

      for (const club of clubs) {
        await sendToIngestion({ type: "CLUB", payload: club });
      }

      // 4. Scrape Results for this season
      const matches: any[] = [];
      $("table.sp-event-blocks tr").each((_, el) => {
        const dateStr = $(el).find(".sp-event-date").text().trim();
        const teams = $(el).find(".sp-event-teams a");
        const home = $(teams[0]).text().trim();
        const away = $(teams[1]).text().trim();
        const score = $(el).find(".sp-event-results").text().trim();
        const matchUrl = $(el).find(".sp-event-results a").attr("href");

        if (home && away && score && !score.includes(":")) {
          matches.push({
            seasonName: season.name,
            homeTeamName: home,
            awayTeamName: away,
            matchDate: dateStr ? new Date(dateStr) : new Date(season.startDate),
            score,
            status: "finished",
            sourceUrl: matchUrl,
          });
        }
      });

      logger.info(
        `Found ${matches.length} historical matches for ${season.name}`,
      );

      for (const m of matches) {
        await sendToIngestion({
          type: "MATCH",
          payload: {
            ...m,
            seasonId: undefined, // Let admin routes resolve by name if we add that or just use seasonName
          },
        });

        // We could also trigger detail scraping here,
        // but for historical it might be a lot of requests.
        // Let's do it for goals at least.
        if (m.sourceUrl) {
          // We'll call the same logic as in ligikuu.ts but imported or copied
          // For now, let's keep it simple to avoid massive overhead in one run
        }
      }
    } catch (error) {
      logger.error({ error, season: season.name }, "Error backfilling season");
    }
  }

  logger.info("Historical backfill completed.");
}

backfillHistory();
