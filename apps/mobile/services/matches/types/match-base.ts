export interface Club {
  id: string;
  name: string;
  slug: string;
}

export interface Team {
  id: string;
  club: Club;
}