import { z } from "zod";

export const MatchEventSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),
  eventType: z.enum([
    "goal",
    "own_goal",
    "yellow_card",
    "red_card",
    "substitution",
    "penalty_scored",
    "penalty_missed",
  ]),
  minute: z.number().int().min(0).max(130),
  playerId: z.string().uuid().optional(),
  relatedPlayerId: z.string().uuid().optional(), // for substitutions
});