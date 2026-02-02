import { apiClient } from "../api-client";
import { SeasonsResponse } from "./types";

export const seasonsService = {
  getSeasons: async (): Promise<SeasonsResponse> => {
    const { data } = await apiClient.get<SeasonsResponse>(
      "/admin/seasons",
    );
    return data;
  },
};