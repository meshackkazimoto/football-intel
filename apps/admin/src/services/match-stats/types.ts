export interface MatchStats {
  id: string;
  matchId: string;
  teamId: string;

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

export interface UpdateMatchStatsInput {
  matchId: string;
  teamId: string;

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