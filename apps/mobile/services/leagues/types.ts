export interface Country {
  id: string;
  name: string;
}

export interface League {
  id: string;
  name: string;
  shortName?: string | null;
  countryId?: string | null;
  country?: Country | null;
}

export interface Season {
  id: string;
  leagueId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface TeamStanding {
  id: string;
  clubId?: string | null;
  team?: { id: string; club?: { id: string; name: string } | null } | null;
}

export interface LeagueStanding {
  id: string;
  seasonId: string;
  teamId: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  team?: TeamStanding | null;
}
