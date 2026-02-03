export type MatchEventType =
  | "goal"
  | "own_goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "penalty_scored"
  | "penalty_missed";

export interface CreateMatchEventInput {
  matchId: string;
  teamId: string;
  eventType: MatchEventType;
  minute: number;
  playerId?: string;
  relatedPlayerId?: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  eventType: MatchEventType;
  minute: number;
  playerId: string | null;
  relatedPlayerId: string | null;
  createdAt: string;
}