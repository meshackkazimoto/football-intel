import { Hono } from "hono";
import { typesense } from "@football-intel/search";
import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { inArray, desc } from "drizzle-orm";
import { Env } from "src/env";

interface PlayerSearchResult {
  id: string;
  fullName: string;
  clubName?: string;
  clubId?: string;
  teamId?: string;
  leagueId?: string;
  seasonId?: string;
}

interface TeamSearchResult {
  id: string;
  name: string;
  clubName: string;
  leagueName: string;
  clubId: string;
  leagueId: string;
  seasonId: string;
}

interface MatchSearchResult {
  id: string;
  matchDate: string;
  status: string;
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
  score: { home: number | null; away: number | null };
}

interface SearchResults {
  players: PlayerSearchResult[];
  teams: TeamSearchResult[];
  matches: MatchSearchResult[];
  clubs: [];
}

const app = new Hono<Env>();

app.get("/", async (c) => {
  const q = c.req.query("q") ?? "";
  const type = c.req.query("type") ?? "all";

  const startedAt = Date.now();

  const results: SearchResults = {
    players: [],
    teams: [],
    matches: [],
    clubs: [],
  };

  if (type === "all" || type === "players") {
    const res = await typesense.collections("players").documents().search({
      q: q || "*",
      query_by: "fullName",
      limit: 10,
    });

    results.players = (res.hits ?? []).map(
      (h) => h.document as PlayerSearchResult
    );
  }

  let matchedTeamIds: string[] = [];

  if (type === "all" || type === "teams") {
    const res = await typesense.collections("teams").documents().search({
      q: q || "*",
      query_by: "name,clubName,leagueName",
      limit: 10,
    });

    const teams = (res.hits ?? []).map(
      (h) => h.document as TeamSearchResult
    );

    results.teams = teams;
    matchedTeamIds = teams.map((t) => t.id);
  }

  // Only search matches if we found team IDs
  if ((type === "all" || type === "matches") && matchedTeamIds.length > 0) {
    const rows = await db.query.matches.findMany({
      where: inArray(matches.homeTeamId, matchedTeamIds),
      with: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [desc(matches.matchDate)],
      limit: 10,
    });

    results.matches = rows.map((m) => ({
      id: m.id,
      matchDate: m.matchDate.toISOString(),
      status: m.status,
      homeTeam: {
        id: m.homeTeam.id,
        name: m.homeTeam.name,
      },
      awayTeam: {
        id: m.awayTeam.id,
        name: m.awayTeam.name,
      },
      score: {
        home: m.homeScore,
        away: m.awayScore,
      },
    }));
  }

  return c.json({
    query: q,
    results,
    meta: {
      tookMs: Date.now() - startedAt,
    },
  });
});

export default app;