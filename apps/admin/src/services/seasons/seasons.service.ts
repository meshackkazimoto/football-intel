import { apiClient } from "../api-client";
import {
  SeasonsResponse,
  Season,
  CreateSeasonInput,
  UpdateSeasonInput,
} from "./types";

export const seasonsService = {
  getSeasons: async (): Promise<SeasonsResponse> => {
    const { data } = await apiClient.get<SeasonsResponse>("/admin/seasons");
    return data;
  },

  createSeason: async (input: CreateSeasonInput): Promise<Season> => {
    const { data } = await apiClient.post<Season>("/admin/seasons", input);
    return data;
  },

  updateSeason: async (
    id: string,
    input: UpdateSeasonInput,
  ): Promise<Season> => {
    const { data } = await apiClient.patch<Season>(
      `/admin/seasons/${id}`,
      input,
    );
    return data;
  },

  deleteSeason: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/seasons/${id}`);
  },
};
