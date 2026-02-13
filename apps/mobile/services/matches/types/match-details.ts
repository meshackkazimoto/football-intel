import type { MatchStatus } from './match-list';

export interface MatchDetails {
  id: string;
  status: MatchStatus | 'postponed';
  minute: number | null;
  period: '1H' | 'HT' | '2H' | 'FT' | null;
  matchDate: string;
  venue: string | null;

  score: {
    home: number | null;
    away: number | null;
  };

  competition: {
    seasonId: string;
    seasonName: string;
    leagueId: string;
    leagueName: string;
    country: string;
  };

  teams: {
    home: MatchTeam;
    away: MatchTeam;
  };

  timeline: MatchTimelineEvent[];
  lastEvent: MatchTimelineEvent | null;

  stats: {
    home: MatchTeamStats | null;
    away: MatchTeamStats | null;
  };

  lineups: {
    home: MatchTeamLineup;
    away: MatchTeamLineup;
  };

  prediction: {
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    predictedHomeScore: number | null;
    predictedAwayScore: number | null;
    algorithm: string;
  } | null;

  standings: {
    table: MatchStandingRow[];
    liveTable: MatchStandingRow[];
    isLiveAdjusted: boolean;
  };
}

export interface MatchTeam {
  id: string;
  name: string;
  club: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface MatchTimelineEvent {
  id: string;
  minute: number;
  type: string;
  teamId: string;
  teamName: string;
  player: {
    id: string;
    fullName: string;
  } | null;
}

export interface MatchTeamStats {
  id: string;
  teamId: string;
  possession: number | null;
  shotsOnTarget: number;
  shotsOffTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  passAccuracy: number | null;
}

export interface MatchLineupPlayer {
  id: string;
  position: string;
  jerseyNumber: number | null;
  player: {
    id: string;
    fullName: string;
    slug: string;
  };
}

export interface MatchTeamLineup {
  starters: MatchLineupPlayer[];
  bench: MatchLineupPlayer[];
}

export interface MatchStandingRow {
  teamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  status: string | null;
  team: {
    id: string;
    name: string;
    club: {
      id: string;
      name: string;
      slug: string;
    };
  };
}
