export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface League {
  id: string;
  name: string;
  shortName?: string | null;
  type?: 'league' | 'cup' | 'playoffs';
  numberOfTeams?: number | null;
  logo?: string | null;
  country: Country;
}