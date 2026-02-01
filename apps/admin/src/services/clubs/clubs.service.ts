import { apiClient } from "../api-client";
import {
  Club,
  CreateClubInput,
} from "./types";

export const clubsService = {
  async getClubs(): Promise<Club[]> {
    const { data } = await apiClient.get<Club[]>(
      "/admin/clubs",
    );
    return data;
  },

  async getClubById(id: string): Promise<Club> {
    const { data } = await apiClient.get<Club>(
      `/admin/clubs/${id}`,
    );
    return data;
  },

  async createClub(
    input: CreateClubInput,
  ): Promise<Club> {
    const { data } = await apiClient.post<Club>(
      "/admin/clubs",
      input,
    );
    return data;
  },

  async updateClub(
    id: string,
    input: Partial<CreateClubInput>,
  ): Promise<Club> {
    const { data } = await apiClient.patch<Club>(
      `/admin/clubs/${id}`,
      input,
    );
    return data;
  },

  async deleteClub(id: string): Promise<void> {
    await apiClient.delete(`/admin/clubs/${id}`);
  },
};