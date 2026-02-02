import { apiClient } from "../api-client";
import { League, CreateLeagueInput } from "./types";

export const leaguesService = {
  getLeagues: async (): Promise<League[]> => {
    const { data } = await apiClient.get<League[]>("/admin/leagues");
    return data;
  },

  createLeague: async (input: CreateLeagueInput): Promise<League> => {
    const { data } = await apiClient.post<League>("/admin/leagues", input);
    return data;
  },

  deleteLeague: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/leagues/${id}`);
  },
};
