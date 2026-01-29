import { apiClient } from "../api-client";
import {
  Club,
  ClubsResponse,
  ClubFilters,
  CreateClubInput,
  UpdateClubInput,
} from "./types";

export const clubsService = {
  getClubs: async (filters?: ClubFilters): Promise<ClubsResponse> => {
    const { data } = await apiClient.get<ClubsResponse>("/clubs", {
      params: filters,
    });
    return data;
  },

  getClubById: async (id: string): Promise<Club> => {
    const { data } = await apiClient.get<Club>(`/clubs/${id}`);
    return data;
  },

  createClub: async (input: CreateClubInput): Promise<Club> => {
    const { data } = await apiClient.post<Club>("/clubs", input);
    return data;
  },

  updateClub: async (id: string, input: UpdateClubInput): Promise<Club> => {
    const { data } = await apiClient.patch<Club>(`/clubs/${id}`, input);
    return data;
  },

  deleteClub: async (id: string): Promise<void> => {
    await apiClient.delete(`/clubs/${id}`);
  },
};
