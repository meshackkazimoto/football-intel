export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Player {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nationality: Country | null;
  preferredFoot: "left" | "right" | "both" | null;
  height: number | null;
  createdAt: string;
}

export interface CreatePlayerInput {
  fullName: string;
  firstName?: string;
  lastName?: string;
  slug: string;
  dateOfBirth?: string;
  nationalityId?: string;
  preferredFoot?: "left" | "right" | "both";
  height?: number;
}

export interface UpdatePlayerInput extends Partial<CreatePlayerInput> {
  // Add specific properties here if needed
  slug?: string;
}

export interface PlayersResponse {
  data: Player[];
  total: number;
}

export interface PlayerFilters {
  search?: string;
  page?: number;
  limit?: number;
  // Add any additional filters if needed
}