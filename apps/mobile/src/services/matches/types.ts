export interface Match {
  id: string;
  matchDate: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore: number | null;
  awayScore: number | null;
  homeTeamId: string;
  awayTeamId: string;
  seasonId: string;
  homeTeam?: {
    id: string;
    club: {
      id: string;
      name: string;
      shortName?: string;
    };
  };
  awayTeam?: {
    id: string;
    club: {
      id: string;
      name: string;
      shortName?: string;
    };
  };
}

export interface MatchEvent {
  minute: number;
  player?: {
    id: string;
    fullName: string;
  };
  teamId: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'disallowed_goal';
}

export interface MatchResult extends Match {
  timeline: MatchEvent[];
  lineups: {
    home: any[];
    away: any[];
  };
  scoreBreakdown: {
    fullTime: {
      home: number;
      away: number;
    };
  };
}

export interface MatchesResponse {
  data: Match[];
  page: number;
  limit: number;
  total?: number;
}
