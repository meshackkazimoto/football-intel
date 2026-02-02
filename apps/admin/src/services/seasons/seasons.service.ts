import { apiClient } from "../api-client";
import { SeasonsResponse, Season, CreateSeasonInput } from "./types";

export const seasonsService = {
  getSeasons: async (): Promise<SeasonsResponse> => {
    const { data } = await apiClient.get<SeasonsResponse>("/admin/seasons");
    return data;
  },

  createSeason: async (input: CreateSeasonInput): Promise<Season> => {
    const { data } = await apiClient.post<Season>("/admin/seasons", input);
    return data;
  },

  deleteSeason: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/seasons/${id}`);
  },
};
