import { z } from "zod";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "half_time"
  | "finished"
  | "postponed"
  | "cancelled";

export interface Team {
  id: string;
  name: string;
  logo?: string;
}

export interface Match {
  id: string;
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string;
  venue: string | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  currentMinute: number | null;
  period: string | null;
}

export interface MatchesResponse {
  data: Match[];
}

export interface MatchFilters {
  status?: string;
  seasonId?: string;
  teamId?: string;
  startDate?: string;
  endDate?: string;
}

export const createMatchSchema = z.object({
  seasonId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  matchDate: z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid match date",
  }),
  venue: z.string().optional(),
  status: z
    .enum(["scheduled", "live", "finished", "postponed", "cancelled"])
    .optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
