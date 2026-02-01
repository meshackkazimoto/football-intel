import { z } from "zod";

export const CreateLineupSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),
  players: z
    .array(
      z.object({
        playerId: z.string().uuid(),
        position: z.string().min(1),
        isStarting: z.boolean(),
        jerseyNumber: z.number().int().positive().optional(),
      }),
    )
    .min(1),
});

export const UpdateLineupSchema = CreateLineupSchema.partial();