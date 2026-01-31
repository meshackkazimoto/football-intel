import type { Team } from './match-base';

export interface MatchResult {
  id: string;

  homeTeam: Team;
  awayTeam: Team;

  homeScore: number;
  awayScore: number;

  timeline: {
    minute: number;
    type: string;
    teamId: string;
    player?: {
      id: string;
      fullName: string;
    } | null;
  }[];

  lineups: {
    home: any[];
    away: any[];
  };
}