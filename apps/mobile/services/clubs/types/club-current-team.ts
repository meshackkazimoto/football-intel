export interface ClubWithCurrentTeam {
  club: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
    season: {
      id: string;
      name: string;
      isCurrent: boolean;
    };
  };
}