export interface Player {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  position: string | null;
  jerseyNumber: number | null;
  height: number | null;
  weight: number | null;
  clubName: string | null;
}

export interface PlayersResponse {
  data: Player[];
  page: number;
  limit: number;
  total?: number;
}
