export interface PlayerContractPlayer {
  id: string;
  fullName: string;
}

export interface PlayerContractTeam {
  id: string;
  name: string;
  club?: { id: string; name: string } | null;
  season?: { id: string; name: string } | null;
}

export interface PlayerContract {
  id: string;
  playerId: string;
  teamId: string;
  position: string;
  jerseyNumber: number | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  createdAt: string;
  player?: PlayerContractPlayer;
  team?: PlayerContractTeam;
}

export interface CreatePlayerContractInput {
  playerId: string;
  teamId: string;
  position: string;
  jerseyNumber?: number;
  startDate: string;
  endDate?: string;
}

export interface PlayerContractFilters {
  playerId?: string;
  teamId?: string;
}
