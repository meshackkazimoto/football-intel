import { z } from "zod";
import { createLeagueSchema } from "./validation";

export interface League {
  id: string;
  name: string;
  shortName: string | null;
  countryId: string;
  tier: number;
  type: string;
  numberOfTeams: number | null;
  logo: string | null;
  createdAt: string;
}

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;

export interface LeaguesResponse {
  data: League[];
  total: number;
}
