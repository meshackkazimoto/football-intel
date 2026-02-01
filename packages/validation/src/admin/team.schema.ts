import { z } from "zod";

export const createTeamSchema = z.object({
  clubId: z.string().uuid(),
  seasonId: z.string().uuid(),
  name: z.string().min(2).max(200),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).max(200).optional(),
});