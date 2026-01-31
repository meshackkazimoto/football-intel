export interface ClubDetails {
  id: string;
  name: string;
  slug: string;
  countryId: string;

  foundedYear?: number;
  stadiumName?: string;
  stadiumCapacity?: number;

  isActive: boolean;

  metadata?: {
    nickname?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };

  createdAt: string;

  country: {
    id: string;
    name: string;
    code: string;
    createdAt: string;
  };

  teams: ClubTeam[];
}

export interface ClubTeam {
  id: string;
  name: string;
  createdAt: string;

  season: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    createdAt: string;
  };
}