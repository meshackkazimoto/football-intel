import { z } from "zod";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "half_time"
  | "finished"
  | "postponed";

export type MatchPeriod = "1H" | "HT" | "2H" | "FT";

export interface Team {
  id: string;
  name: string;
  logo?: string;
}

interface MatchEventPlayer {
  id: string;
  fullName: string;
}

interface MatchEventTeam {
  id: string;
  name: string;
}

interface Event {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string | null;
  eventType: string;
  minute: number;
  createdAt: string;
  player?: MatchEventPlayer | null;
  team?: MatchEventTeam | null;
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
  period: MatchPeriod | null;
  events: Event[] | []
}

export interface MatchesResponse {
  data: Match[];
}

export interface MatchFilters {
  status?: MatchStatus;
  seasonId?: string;
}

export const createMatchSchema = z.object({
  seasonId: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  matchDate: z
      .string()
      .min(1, "Match date is required")
      .transform((v) => new Date(v).toISOString())
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid datetime"),
  venue: z.string().max(200).optional(),
});

export const updateMatchSchema = z.object({
  status: z
    .enum(["scheduled", "live", "half_time", "finished", "postponed"])
    .optional(),
  matchDate: z.string().datetime().optional(),
  venue: z.string().max(200).optional(),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  currentMinute: z.number().int().min(0).max(130).optional(),
  period: z.enum(["1H", "HT", "2H", "FT"]).optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>;
