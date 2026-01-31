export interface Club {
  id: string;
  name: string;
  slug: string;
}

export interface Season {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;

  club: Club;
  season: Season;
}