export type MatchStatus =
  | "scheduled"
  | "live"
  | "half_time"
  | "finished";

export type MatchPeriod = "1H" | "HT" | "2H" | "FT";

export type RuntimeMatch = {
  id: string;
  status: MatchStatus;
  currentMinute: number | null;
  startedAt: Date | null;
  period: MatchPeriod | null;
};