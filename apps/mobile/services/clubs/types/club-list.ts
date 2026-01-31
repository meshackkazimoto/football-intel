export interface ClubListItem {
  id: string;
  name: string;
  slug: string;
  foundedYear?: number;
  stadiumName?: string;
  stadiumCapacity?: number;
  metadata?: {
    nickname?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
  country: {
    id: string;
    name: string;
    code: string;
  };
}