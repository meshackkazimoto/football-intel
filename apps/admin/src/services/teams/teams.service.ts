import { apiClient } from "../api-client";
import { TeamsResponse } from "./types";

export const teamsService = {
  getTeams: async (seasonId: string): Promise<TeamsResponse> => {
    const { data } = await apiClient.get<TeamsResponse>(
      `/admin/teams?seasonId=${seasonId}`,
    );
    return data;
  },
};