/* -------------------------------------------------------------------------- */
/*                                   PLAYERS                                  */
/* -------------------------------------------------------------------------- */

export interface PlayerSearchResult {
  id: string;
  fullName: string;
  position?: string;
  clubId?: string;
  clubName?: string;
  teamId?: string;
  leagueId?: string;
  seasonId?: string;
}

/* -------------------------------------------------------------------------- */
/*                                    TEAMS                                   */
/* -------------------------------------------------------------------------- */

export interface TeamSearchResult {
  id: string;
  name: string;
  clubId: string;
  clubName: string;
  leagueId: string;
  leagueName: string;
  seasonId: string;
  seasonName: string;
}

/* -------------------------------------------------------------------------- */
/*                                   MATCHES                                  */
/* -------------------------------------------------------------------------- */

export interface MatchSearchResult {
  id: string;
  matchDate: string; // ISO string
  status: string;

  league: {
    id: string;
    name: string;
  };

  homeTeam: {
    id: string;
    name: string;
  };

  awayTeam: {
    id: string;
    name: string;
  };

  score: {
    home: number | null;
    away: number | null;
  };
}

/* -------------------------------------------------------------------------- */
/*                                    CLUBS                                   */
/* -------------------------------------------------------------------------- */

export interface ClubSearchResult {
  id: string;
  name: string;
  slug: string;
  countryId: string;
}

/* -------------------------------------------------------------------------- */
/*                               SEARCH RESPONSE                               */
/* -------------------------------------------------------------------------- */

export interface SearchResults {
  players: PlayerSearchResult[];
  teams: TeamSearchResult[];
  matches: MatchSearchResult[];
  clubs: ClubSearchResult[];
}

export interface SearchMeta {
  tookMs: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResults;
  meta: SearchMeta;
}