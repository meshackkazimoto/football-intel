import { z } from "zod";

export const matchSchema = z.object({
  id: z.string().uuid(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number().nullable(),
  awayScore: z.number().nullable(),
  status: z.enum(["scheduled", "live", "finished", "postponed", "cancelled"]),
  date: z.string(),
  venue: z.string().nullable(),
  competition: z.string(),
});

export const createMatchSchema = z.object({
  seasonId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  matchDate: z.string(),
  venue: z.string().optional(),
  status: z
    .enum(["scheduled", "live", "finished", "postponed", "cancelled"])
    .optional(),
});

export const updateMatchSchema = createMatchSchema.partial().extend({
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
});

export type Match = z.infer<typeof matchSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;

export interface MatchesResponse {
  matches: Match[];
  total: number;
}

export interface MatchFilters {
  status?: string;
  seasonId?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}
