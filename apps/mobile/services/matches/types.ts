export interface Club {
  id: string;
  name: string;
  shortName?: string | null;
  countryId?: string | null;
  country?: { id: string; name: string } | null;
}

export interface Team {
  id: string;
  clubId: string;
  club?: Club | null;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  matchDate: string;
  venue?: string | null;
}

export interface MatchesListResponse {
  data: Match[];
  page: number;
  limit: number;
}
