export type MatchStatus =
  | "scheduled"
  | "live"
  | "half_time"
  | "finished"
  | "postponed";

export type FixtureStatus =
  | "scheduled"
  | "live"
  | "half_time"
  | "finished"
  | "postponed";

export interface Team {
  id: string;
  name: string;
}

export interface Fixture {
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
  period: "1H" | "HT" | "2H" | "FT" | null;
}

export interface FixturesResponse {
  fixtures: Fixture[];
}

export interface FixtureFilters {
  seasonId?: string;
  status?: MatchStatus;
}

export interface CreateFixtureInput {
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  venue?: string;
}

export interface UpdateFixtureInput {
  status?: MatchStatus;
  matchDate?: string;
  venue?: string;
  homeScore?: number;
  awayScore?: number;
  currentMinute?: number;
  period?: "1H" | "HT" | "2H" | "FT";
}