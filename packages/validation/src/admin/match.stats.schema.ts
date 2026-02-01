import { z } from "zod";

export const MatchStatsSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),

  possession: z.number().int().min(0).max(100).optional(),
  shotsOnTarget: z.number().int().min(0).optional(),
  shotsOffTarget: z.number().int().min(0).optional(),
  corners: z.number().int().min(0).optional(),
  fouls: z.number().int().min(0).optional(),
  yellowCards: z.number().int().min(0).optional(),
  redCards: z.number().int().min(0).optional(),
  saves: z.number().int().min(0).optional(),
  passAccuracy: z.number().int().min(0).max(100).optional(),
});