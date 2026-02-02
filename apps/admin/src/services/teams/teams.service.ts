import { apiClient } from "../api-client";
import { TeamsResponse, CreateTeamInput, Team } from "./types";

export const teamsService = {
  getTeams: async (seasonId: string): Promise<TeamsResponse> => {
    const { data } = await apiClient.get<TeamsResponse>(
      `/admin/teams?seasonId=${seasonId}`,
    );
    return data;
  },

  createTeam: async (input: CreateTeamInput): Promise<Team> => {
    const { data } = await apiClient.post<Team>("/admin/teams", input);
    return data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/teams/${id}`);
  },
};
