export interface LeagueStandingsResponse {
  seasonId: string;

  league: {
    id: string;
    name: string;
    country: string;
    season: string;
  };

  standings: LeagueStandingRow[];
}

export interface LeagueStandingRow {
  position: number;

  team: {
    id: string;
    name: string;
    clubName: string;
  };

  played: number;
  wins: number;
  draws: number;
  losses: number;

  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;

  points: number;

  status?: 'normal' | 'champions' | 'relegated' | 'caf' | 'playoffs';
}