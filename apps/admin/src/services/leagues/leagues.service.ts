import { apiClient } from "../api-client";
import { League } from "./types";

export const leaguesService = {
  getLeagues: async (): Promise<League[]> => {
    const { data } = await apiClient.get<League[]>("/admin/leagues");
    return data;
  },
};
