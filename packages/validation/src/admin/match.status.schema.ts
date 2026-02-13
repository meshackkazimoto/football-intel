import { z } from "zod";

export const MatchStatusSchema = z.object({
  matchId: z.string().uuid(),
  status: z.enum([
    "scheduled",
    "live",
    "half_time",
    "finished",
    "postponed",
    "abandoned",
    "cancelled",
  ]),
  currentMinute: z.number().int().min(0).max(130).optional(),
});
