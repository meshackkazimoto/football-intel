export interface Standing {
  id: string;
  seasonId: string;
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  team?: {
    id: string;
    club: {
      id: string;
      name: string;
      shortName?: string;
    };
  };
}
