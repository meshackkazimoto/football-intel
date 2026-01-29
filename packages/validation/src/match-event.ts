import { z } from "zod";

export const matchEventSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),
  playerId: z.string().uuid().optional(),
  eventType: z.enum(["goal", "yellow_card", "red_card"]),
  minute: z.number().min(0).max(130)
});