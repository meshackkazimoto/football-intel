import type { MatchStatus, MatchPeriod } from "./types";

export function isMatchStatus(value: unknown): value is MatchStatus {
  return (
    value === "scheduled" ||
    value === "live" ||
    value === "half_time" ||
    value === "finished"
  );
}

export function isMatchPeriod(value: unknown): value is MatchPeriod {
  return value === "1H" || value === "HT" || value === "2H" || value === "FT";
}