export interface ClubWithCurrentTeam {
  club: Club;
  team: Team;
}
export interface Club {
  id: string;
  name: string;
  slug: string;
  foundedYear?: number;
  stadiumName?: string;
  stadiumCapacity?: number;
  metadata?: {
    colors?: {
      primary: string;
      secondary: string;
    };
    nickname?: string;
  };
  country?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface Season {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface Team {
  id: string;
  name: string;
  season: Season;
}