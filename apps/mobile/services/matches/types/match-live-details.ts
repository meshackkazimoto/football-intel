export type MatchLiveStatus =
  | 'live'
  | 'half_time'
  | 'finished'
  | 'postponed';

export type MatchPeriod = '1H' | 'HT' | '2H' | 'FT';

export type MatchEventType =
  | 'goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'penalty_goal'
  | 'own_goal';

export interface MatchLiveDetails {
  id: string;
  status: MatchLiveStatus;
  minute: number | null;
  period: MatchPeriod | null;

  matchDate: string;
  venue?: string;

  score: {
    home: number | null;
    away: number | null;
  };

  teams: {
    home: {
      id: string;
      name: string;
      club: {
        id: string;
        name: string;
        slug: string;
      };
    };
    away: {
      id: string;
      name: string;
      club: {
        id: string;
        name: string;
        slug: string;
      };
    };
  };

  lastEvent: {
    minute: number;
    type: MatchEventType;
    teamId: string;
    player?: {
      id: string;
      fullName: string;
    } | null;
  } | null;

  timeline: {
    minute: number;
    type: MatchEventType;
    teamId: string;
  }[];

  stats: {
    home: TeamLiveStats | null;
    away: TeamLiveStats | null;
  };

  updatedAt: string;
}

export interface TeamLiveStats {
  possession?: number;
  shotsOnTarget?: number;
  shotsOffTarget?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  saves?: number;
  passAccuracy?: number;
}