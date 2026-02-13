export interface TeamDetails {
  id: string;
  name: string;

  club: {
    id: string;
    name: string;
    stadiumName: string | null;
  };

  league: {
    id: string;
    name: string;
    country: string;
    season: string;
  };

  standings: {
    position: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    winRatio: string;
    averageGoals: string;
    form: Array<'W' | 'D' | 'L'>;
  } | null;

  performance: {
    home: TeamPerformance;
    away: TeamPerformance;
  };

  squad: TeamPlayer[];
}

export interface TeamPerformance {
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface TeamPlayer {
  id: string;
  fullName: string;
  position: string;
  jerseyNumber: number | null;
}
