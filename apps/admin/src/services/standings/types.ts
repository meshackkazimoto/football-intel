import { z } from "zod";
import { Team } from "@/services/teams/types";
import { Season } from "@/services/seasons/types";
import { CreateStandingSchema, UpdateStandingSchema } from "./validation";

export interface Standing {
  id: string;
  seasonId: string;
  teamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  pointsDeduction: number;
  status: string | null;
  lastComputedAt: string;

  team: Team;
  season: Season;
}

export interface StandingsResponse {
  data: Standing[];
}

export type CreateStandingInput = z.infer<typeof CreateStandingSchema>;
export type UpdateStandingInput = z.infer<typeof UpdateStandingSchema>;
