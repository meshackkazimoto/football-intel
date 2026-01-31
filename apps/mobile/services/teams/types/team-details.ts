import type { Team } from './team-base';

export interface TeamPlayerContract {
  id: string;
  position: string;
  jerseyNumber: number | null;

  player: {
    id: string;
    fullName: string;
    slug: string;
  };
}

export interface TeamDetails extends Team {
  contracts: TeamPlayerContract[];
}