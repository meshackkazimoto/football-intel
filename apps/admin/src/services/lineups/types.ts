export interface LineupPlayerInput {
  playerId: string;
  position: string;
  isStarting: boolean;
  jerseyNumber?: number;
}

export interface CreateLineupInput {
  matchId: string;
  teamId: string;
  players: LineupPlayerInput[];
}
