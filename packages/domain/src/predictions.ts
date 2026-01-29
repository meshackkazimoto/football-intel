import { db } from "@football-intel/db/src/client";
import {
  matches,
  leagueStandings,
  matchPredictions,
  playerMatchRatings,
  matchEvents,
} from "@football-intel/db/src/schema/core";
import { eq, and, sql } from "drizzle-orm";

/**
 * Predicts match outcome using a simplified Poisson distribution model
 */
export async function generateMatchPrediction(matchId: string) {
  const match = await db.query.matches.findFirst({
    where: eq(matches.id, matchId),
  });

  if (!match || match.status !== "scheduled") return;

  // Get team performance in the current season
  const homeStats = await db.query.leagueStandings.findFirst({
    where: and(
      eq(leagueStandings.seasonId, match.seasonId),
      eq(leagueStandings.teamId, match.homeTeamId),
    ),
  });

  const awayStats = await db.query.leagueStandings.findFirst({
    where: and(
      eq(leagueStandings.seasonId, match.seasonId),
      eq(leagueStandings.teamId, match.awayTeamId),
    ),
  });

  if (!homeStats ||!awayStats ||homeStats.played === 0 ||awayStats.played === 0) {
    // Default to 40%/30%/30% if no data
    await db
      .insert(matchPredictions)
      .values({
        id: crypto.randomUUID(),
        matchId,
        homeWinProb: 40,
        drawProb: 30,
        awayWinProb: 30,
        algorithm: "default",
      })
      .onConflictDoNothing();
    return;
  }

  // Simplified Poisson Logic
  // lambda_home = home_attack_strength * away_defense_weakness * league_avg_home_goals
  // For simplicity: (home_goals_scored / played) * (away_goals_conceded / played)
  const homeLambda = (homeStats.goalsFor / homeStats.played) * (awayStats.goalsAgainst / awayStats.played);
  const awayLambda = (awayStats.goalsFor / awayStats.played) * (homeStats.goalsAgainst / homeStats.played);

  // Convert lambdas to probabilities (simplified approximation)
  const total = homeLambda + awayLambda + 1; // +1 to account for draw weight
  const homeWinProb = Math.round((homeLambda / total) * 100);
  const awayWinProb = Math.round((awayLambda / total) * 100);
  const drawProb = 100 - homeWinProb - awayWinProb;

  await db
    .insert(matchPredictions)
    .values({
      id: crypto.randomUUID(),
      matchId,
      homeWinProb,
      drawProb,
      awayWinProb,
      predictedHomeScore: Math.round(homeLambda),
      predictedAwayScore: Math.round(awayLambda),
      algorithm: "poisson_v1",
    })
    .onConflictDoUpdate({
      target: [matchPredictions.matchId],
      set: {
        homeWinProb,
        drawProb,
        awayWinProb,
        predictedHomeScore: Math.round(homeLambda),
        predictedAwayScore: Math.round(awayLambda),
      },
    });
}

/**
 * Calculates a match rating for a single player based on events
 */
export async function computePlayerMatchRating(
  playerId: string,
  matchId: string,
) {
  const events = await db.query.matchEvents.findMany({
    where: and(
      eq(matchEvents.matchId, matchId),
      eq(matchEvents.playerId, playerId),
    ),
  });

  let score = 600; // Base rating 6.0

  for (const e of events) {
    switch (e.eventType) {
      case "goal":
        score += 150;
        break;
      case "assist":
        score += 100;
        break;
      case "shot_on_target":
        score += 30;
        break;
      case "yellow_card":
        score -= 50;
        break;
      case "red_card":
        score -= 200;
        break;
      case "foul":
        score -= 10;
        break;
      case "save":
        score += 40;
        break;
    }
  }

  // Cap at 10.0 (1000) and floor at 3.0 (300)
  score = Math.min(1000, Math.max(300, score));

  await db
    .insert(playerMatchRatings)
    .values({
      id: crypto.randomUUID(),
      playerId,
      matchId,
      rating: score,
      metadata: { eventsCount: events.length },
    })
    .onConflictDoUpdate({
      target: [playerMatchRatings.playerId, playerMatchRatings.matchId],
      set: {
        rating: score,
        metadata: { eventsCount: events.length },
      },
    });
}

/**
 * Batch compute ratings for every player in a match
 */
export async function computeAllPlayerRatingsForMatch(matchId: string) {
  const eventsData = await db.query.matchEvents.findMany({
    where: eq(matchEvents.matchId, matchId),
  });

  const uniquePlayerIds = [
    ...new Set(eventsData.map((e) => e.playerId).filter((id) => id !== null)),
  ] as string[];

  for (const playerId of uniquePlayerIds) {
    await computePlayerMatchRating(playerId, matchId);
  }
}

/**
 * Recompute predictions for all upcoming matches in a season
 */
export async function recomputeAllPredictionsForSeason(seasonId: string) {
  const upcomingMatches = await db.query.matches.findMany({
    where: and(eq(matches.seasonId, seasonId), eq(matches.status, "scheduled")),
  });

  for (const m of upcomingMatches) {
    await generateMatchPrediction(m.id);
  }
}
