import type { Team } from './match-base';

export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'finished'
  | 'half_time'
  | 'postponed'
  | 'abandoned'
  | 'cancelled';

export interface MatchListItem {
  id: string;
  matchDate: string;
  venue?: string | null;

  status: MatchStatus;

  homeScore: number | null;
  awayScore: number | null;

  homeTeam: Team;
  awayTeam: Team;
}

export interface MatchesListResponse {
  data: MatchListItem[];
  page: number;
  limit: number;
}
