import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { db } from "@football-intel/db/src/client";
import {
  matches,
  matchEvents,
  matchLineups,
  matchStats,
  matchPredictions,
  leagueStandings,
} from "@football-intel/db/src/schema/core";
import { eq, and, gte, lte, desc, asc, or, sql } from "drizzle-orm";
import { createRateLimiter } from "../../../middleware/rate-limit";
import { cacheMiddleware } from "../../../middleware/cache";
import {
  paginationSchema,
  getPaginationOffset,
} from "@football-intel/validation";
import { Env } from "src/env";

const app = new Hono<Env>();

type StandingsRow = {
  teamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  pointsDeduction: number | null;
  status: string | null;
  team: {
    id: string;
    name: string;
    club: {
      id: string;
      name: string;
      slug: string;
    };
  };
};

function normalizeStandingsRows(rows: StandingsRow[]) {
  return rows.map((row) => ({
    teamId: row.teamId,
    position: row.position,
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points - (row.pointsDeduction ?? 0),
    status: row.status,
    team: {
      id: row.team.id,
      name: row.team.name,
      club: {
        id: row.team.club.id,
        name: row.team.club.name,
        slug: row.team.club.slug,
      },
    },
  }));
}

function computeLiveStandings(
  rows: StandingsRow[],
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number | null,
  awayScore: number | null,
) {
  const normalized = normalizeStandingsRows(rows);

  if (homeScore === null || awayScore === null) {
    return normalized;
  }

  const homeRow = normalized.find((row) => row.teamId === homeTeamId);
  const awayRow = normalized.find((row) => row.teamId === awayTeamId);

  if (!homeRow || !awayRow) {
    return normalized;
  }

  const applyLiveOutcome = (
    row: typeof homeRow,
    goalsForDelta: number,
    goalsAgainstDelta: number,
    outcome: "win" | "draw" | "loss",
  ) => {
    row.played += 1;
    row.goalsFor += goalsForDelta;
    row.goalsAgainst += goalsAgainstDelta;
    row.goalDifference = row.goalsFor - row.goalsAgainst;

    if (outcome === "win") {
      row.wins += 1;
      row.points += 3;
      return;
    }

    if (outcome === "draw") {
      row.draws += 1;
      row.points += 1;
      return;
    }

    row.losses += 1;
  };

  if (homeScore > awayScore) {
    applyLiveOutcome(homeRow, homeScore, awayScore, "win");
    applyLiveOutcome(awayRow, awayScore, homeScore, "loss");
  } else if (homeScore < awayScore) {
    applyLiveOutcome(homeRow, homeScore, awayScore, "loss");
    applyLiveOutcome(awayRow, awayScore, homeScore, "win");
  } else {
    applyLiveOutcome(homeRow, homeScore, awayScore, "draw");
    applyLiveOutcome(awayRow, awayScore, homeScore, "draw");
  }

  return normalized
    .slice()
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.club.name.localeCompare(b.team.club.name);
    })
    .map((row, index) => ({
      ...row,
      position: index + 1,
    }));
}

app.get("/", createRateLimiter(50, 60), cacheMiddleware(30), async (c) => {
  const seasonId = c.req.query("seasonId");
  const status = c.req.query("status"); // scheduled | finished

  const query = paginationSchema.parse(c.req.query());
  const offset = getPaginationOffset(query.page, query.limit);

  const data = await db.query.matches.findMany({
    where: and(
      seasonId ? eq(matches.seasonId, seasonId) : undefined,
      status ? eq(matches.status, status) : undefined,
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [desc(matches.matchDate)],
    limit: query.limit,
    offset: offset,
  });

  return c.json({
    data,
    page: query.page,
    limit: query.limit,
  });
});

app.get("/today", createRateLimiter(50, 60), async (c) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const data = await db.query.matches.findMany({
    where: and(
      gte(matches.matchDate, startOfDay),
      lte(matches.matchDate, endOfDay),
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [asc(matches.matchDate)],
  });

  return c.json(data);
});

app.get("/recent", createRateLimiter(50, 60), async (c) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const data = await db.query.matches.findMany({
    where: and(
      eq(matches.status, "finished"),
      gte(matches.matchDate, sevenDaysAgo),
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [desc(matches.matchDate)],
    limit: 20,
  });

  return c.json(data);
});

app.get("/upcoming", createRateLimiter(50, 60), async (c) => {
  const now = new Date();
  const sevenDaysAhead = new Date();
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);

  const data = await db.query.matches.findMany({
    where: and(
      eq(matches.status, "scheduled"),
      gte(matches.matchDate, now),
      lte(matches.matchDate, sevenDaysAhead),
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [asc(matches.matchDate)],
    limit: 20,
  });

  return c.json(data);
});

app.get("/:id/result", createRateLimiter(100, 60), async (c) => {
  const id = c.req.param("id");

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, id),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
      events: {
        with: {
          player: true,
          team: true,
        },
        orderBy: [asc(matchEvents.minute)],
      },
      lineups: {
        with: {
          player: true,
        },
      },
    },
  });

  if (!match) {
    return c.json({ error: "Match not found" }, 404);
  }

  // Formatting response
  const response = {
    ...match,
    timeline: match.events.map((event) => ({
      minute: event.minute,
      player: event.player,
      teamId: event.teamId,
      type: event.eventType,
    })),
    lineups: {
      home: match.lineups.filter((l) => l.teamId === match.homeTeamId),
      away: match.lineups.filter((l) => l.teamId === match.awayTeamId),
    },
    scoreBreakdown: {
      fullTime: {
        home: match.homeScore,
        away: match.awayScore,
      },
    },
  };

  return c.json(response);
});

app.get("/:id/stats", createRateLimiter(50, 60), async (c) => {
  const id = c.req.param("id");

  const stats = await db.query.matchStats.findMany({
    where: eq(matchStats.matchId, id),
    with: {
      team: { with: { club: true } },
    },
  });

  return c.json(stats);
});

app.get("/:id/details", createRateLimiter(80, 60), async (c) => {
  const id = c.req.param("id");

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, id),
    with: {
      season: {
        with: {
          league: {
            with: {
              country: true,
            },
          },
        },
      },
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
      events: {
        with: {
          player: true,
          team: {
            with: {
              club: true,
            },
          },
        },
        orderBy: [asc(matchEvents.minute), asc(matchEvents.createdAt)],
      },
      stats: {
        with: {
          team: {
            with: {
              club: true,
            },
          },
        },
      },
      lineups: {
        with: {
          player: true,
          team: {
            with: {
              club: true,
            },
          },
        },
        orderBy: [asc(matchLineups.createdAt)],
      },
      prediction: true,
    },
  });

  if (!match) {
    return c.json({ error: "Match not found" }, 404);
  }

  const standingsRows = await db.query.leagueStandings.findMany({
    where: eq(leagueStandings.seasonId, match.seasonId),
    with: {
      team: {
        with: {
          club: true,
        },
      },
    },
    orderBy: [asc(leagueStandings.position)],
  });

  const standings = normalizeStandingsRows(standingsRows as StandingsRow[]);

  const shouldIncludeLiveStandings =
    (match.status === "live" ||
      match.status === "half_time" ||
      match.status === "finished") &&
    match.homeScore !== null &&
    match.awayScore !== null;

  const liveStandings = shouldIncludeLiveStandings
    ? computeLiveStandings(
        standingsRows as StandingsRow[],
        match.homeTeamId,
        match.awayTeamId,
        match.homeScore,
        match.awayScore,
      )
    : standings;

  const groupedLineups = {
    home: {
      starters: match.lineups.filter(
        (lineup) => lineup.teamId === match.homeTeamId && lineup.isStarting,
      ),
      bench: match.lineups.filter(
        (lineup) => lineup.teamId === match.homeTeamId && !lineup.isStarting,
      ),
    },
    away: {
      starters: match.lineups.filter(
        (lineup) => lineup.teamId === match.awayTeamId && lineup.isStarting,
      ),
      bench: match.lineups.filter(
        (lineup) => lineup.teamId === match.awayTeamId && !lineup.isStarting,
      ),
    },
  };

  const stats = {
    home: match.stats.find((row) => row.teamId === match.homeTeamId) ?? null,
    away: match.stats.find((row) => row.teamId === match.awayTeamId) ?? null,
  };

  const timeline = match.events.map((event) => ({
    id: event.id,
    minute: event.minute,
    type: event.eventType,
    teamId: event.teamId,
    teamName: event.team.club.name,
    player: event.player
      ? {
          id: event.player.id,
          fullName: event.player.fullName,
        }
      : null,
  }));

  return c.json({
    id: match.id,
    status: match.status,
    minute: match.currentMinute,
    period: match.period,
    matchDate: match.matchDate,
    venue: match.venue,
    score: {
      home: match.homeScore,
      away: match.awayScore,
    },
    competition: {
      seasonId: match.seasonId,
      seasonName: match.season.name,
      leagueId: match.season.league.id,
      leagueName: match.season.league.name,
      country: match.season.league.country.name,
    },
    teams: {
      home: match.homeTeam,
      away: match.awayTeam,
    },
    timeline,
    lastEvent: timeline.at(-1) ?? null,
    stats,
    lineups: groupedLineups,
    prediction: match.prediction,
    standings: {
      table: standings,
      liveTable: liveStandings,
      isLiveAdjusted: shouldIncludeLiveStandings,
    },
  });
});

app.get("/h2h", createRateLimiter(50, 60), async (c) => {
  const clubA = c.req.query("clubA");
  const clubB = c.req.query("clubB");

  if (!clubA || !clubB) {
    return c.json({ error: "clubA and clubB are required" }, 400);
  }

  const h2hMatches = await db.query.matches.findMany({
    where: sql`
      (home_team_id IN (SELECT id FROM teams WHERE club_id = ${clubA}) AND away_team_id IN (SELECT id FROM teams WHERE club_id = ${clubB}))
      OR
      (home_team_id IN (SELECT id FROM teams WHERE club_id = ${clubB}) AND away_team_id IN (SELECT id FROM teams WHERE club_id = ${clubA}))
    `,
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
    },
    orderBy: [desc(matches.matchDate)],
    limit: 10,
  });

  const summary = {
    total: h2hMatches.length,
    winsA: h2hMatches.filter((m) => {
      const isHomeA = m.homeTeam.club.id === clubA;
      return (
        (isHomeA && m.homeScore! > m.awayScore!) ||
        (!isHomeA && m.awayScore! > m.homeScore!)
      );
    }).length,
    winsB: h2hMatches.filter((m) => {
      const isHomeB = m.homeTeam.club.id === clubB;
      return (
        (isHomeB && m.homeScore! > m.awayScore!) ||
        (!isHomeB && m.awayScore! > m.homeScore!)
      );
    }).length,
    draws: h2hMatches.filter((m) => m.homeScore === m.awayScore).length,
    matches: h2hMatches,
  };

  return c.json(summary);
});

app.get("/:id/prediction", createRateLimiter(50, 60), async (c) => {
  const id = c.req.param("id");
  const prediction = await db.query.matchPredictions.findFirst({
    where: eq(matchPredictions.matchId, id),
  });

  if (!prediction) {
    return c.json({ error: "No prediction available for this match" }, 404);
  }

  return c.json(prediction);
});

app.get("/:id/live-stream", async (c) => {
  const id = c.req.param("id");

  return streamSSE(c, async (stream) => {
    while (true) {
      const match = await db.query.matches.findFirst({
        where: eq(matches.id, id),
        with: {
          events: {
            orderBy: [desc(matchEvents.createdAt)],
            limit: 1,
          },
        },
      });

      if (match) {
        await stream.writeSSE({
          data: JSON.stringify(match),
          event: "match-update",
          id: String(Date.now()),
        });
      }

      await stream.sleep(5000); // Poll every 5 seconds for simulation
    }
  });
});

app.get("/live", createRateLimiter(100, 60), async (c) => {
  const seasonId = c.req.query("seasonId");

  const data = await db.query.matches.findMany({
    where: and(
      eq(matches.status, "live"),
      seasonId ? eq(matches.seasonId, seasonId) : undefined
    ),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
      events: {
        orderBy: [desc(matchEvents.createdAt)],
        limit: 1,
      },
    },
    orderBy: [asc(matches.matchDate)],
  });

  return c.json({
    data: data.map((m) => ({
      id: m.id,
      status: m.status,
      minute: m.currentMinute,
      period: m.period,
      matchDate: m.matchDate,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      score: {
        home: m.homeScore,
        away: m.awayScore,
      },
      lastEvent: m.events[0]
        ? {
            minute: m.events[0].minute,
            type: m.events[0].eventType,
            teamId: m.events[0].teamId,
          }
        : null,
    })),
    count: data.length,
  });
});

app.get("/:id/live", createRateLimiter(100, 60), async (c) => {
  const id = c.req.param("id");

  const match = await db.query.matches.findFirst({
    where: eq(matches.id, id),
    with: {
      homeTeam: { with: { club: true } },
      awayTeam: { with: { club: true } },
      events: {
        with: { player: true },
        orderBy: [asc(matchEvents.minute)],
      },
      stats: {
        with: { team: true },
      },
    },
  });

  if (!match) {
    return c.json({ error: "Match not found" }, 404);
  }

  if (match.status !== "live" && match.status !== "half_time") {
    return c.json(
      { error: "Match is not live", status: match.status },
      409
    );
  }

  const lastEvent = match.events.at(-1) ?? null;

  const stats = {
    home: match.stats.find((s) => s.teamId === match.homeTeamId) ?? null,
    away: match.stats.find((s) => s.teamId === match.awayTeamId) ?? null,
  };

  return c.json({
    id: match.id,
    status: match.status,
    minute: match.currentMinute,
    period: match.period,
    matchDate: match.matchDate,
    venue: match.venue,

    score: {
      home: match.homeScore,
      away: match.awayScore,
    },

    teams: {
      home: match.homeTeam,
      away: match.awayTeam,
    },

    lastEvent: lastEvent
      ? {
          minute: lastEvent.minute,
          type: lastEvent.eventType,
          teamId: lastEvent.teamId,
          player: lastEvent.player
            ? {
                id: lastEvent.player.id,
                fullName: lastEvent.player.fullName,
              }
            : null,
        }
      : null,

    timeline: match.events.map((e) => ({
      minute: e.minute,
      type: e.eventType,
      teamId: e.teamId,
    })),

    stats: {
      home: stats.home,
      away: stats.away,
    },

    updatedAt: new Date().toISOString(),
  });
});

export default app;
