import type { Team } from './match-base';

export interface LiveMatch {
  id: string;
  status: 'live' | 'half_time';

  minute: number | null;
  period: '1H' | 'HT' | '2H' | null;

  matchDate: string;

  homeTeam: Team;
  awayTeam: Team;

  score: {
    home: number | null;
    away: number | null;
  };

  lastEvent: {
    minute: number;
    type: string;
    teamId: string;
  } | null;
}

export interface LiveMatchesResponse {
  data: LiveMatch[];
  count: number;
}