import { z } from "zod";

export const MatchStatsSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),

  possession: z.coerce.number().int().min(0).max(100).optional(),
  shotsOnTarget: z.coerce.number().int().min(0).optional(),
  shotsOffTarget: z.coerce.number().int().min(0).optional(),
  corners: z.coerce.number().int().min(0).optional(),
  fouls: z.coerce.number().int().min(0).optional(),
  yellowCards: z.coerce.number().int().min(0).optional(),
  redCards: z.coerce.number().int().min(0).optional(),
  saves: z.coerce.number().int().min(0).optional(),
  passAccuracy: z.coerce.number().int().min(0).max(100).optional(),
});
