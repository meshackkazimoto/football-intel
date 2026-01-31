export type MatchResultSymbol = 'W' | 'D' | 'L';

export interface TeamPerformance {
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;

  form: MatchResultSymbol[];

  homePerformance: TeamPerformance;
  awayPerformance: TeamPerformance;

  averageGoals: number | string;
  winRatio: string;
}