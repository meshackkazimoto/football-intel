export interface MatchPossession {
  id: string;
  matchId: string;
  teamId: string;
  startSecond: number;
  endSecond: number | null;
  source: string;
  createdAt: string;
  team?: {
    id: string;
    name: string;
  } | null;
}

export interface UpsertMatchPossessionInput {
  matchId: string;
  teamId?: string | null;
  second?: number;
  source?: string;
}
