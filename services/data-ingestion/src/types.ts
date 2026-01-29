export interface ScrapedMatch {
  homeTeamName: string;
  awayTeamName: string;
  matchDate: Date;
  competition?: string;
  sourceUrl?: string;
}

export interface IngestionPayload {
  type:
    | "MATCH"
    | "TEAM"
    | "PLAYER"
    | "LEAGUE"
    | "CLUB"
    | "MATCH_EVENT"
    | "SEASON";
  payload: any;
}
