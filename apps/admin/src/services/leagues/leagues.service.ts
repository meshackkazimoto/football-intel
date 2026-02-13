import { apiClient } from "../api-client";
import { League, CreateLeagueInput, UpdateLeagueInput } from "./types";

export const leaguesService = {
  getLeagues: async (): Promise<League[]> => {
    const { data } = await apiClient.get<League[]>("/admin/leagues");
    return data;
  },

  createLeague: async (input: CreateLeagueInput): Promise<League> => {
    const { data } = await apiClient.post<League>("/admin/leagues", input);
    return data;
  },

  updateLeague: async (
    id: string,
    input: UpdateLeagueInput,
  ): Promise<League> => {
    const { data } = await apiClient.patch<League>(
      `/admin/leagues/${id}`,
      input,
    );
    return data;
  },

  deleteLeague: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/leagues/${id}`);
  },
};
