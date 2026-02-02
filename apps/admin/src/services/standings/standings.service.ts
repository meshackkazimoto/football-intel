import { apiClient } from "../api-client";
import {
  Standing,
  StandingsResponse,
  CreateStandingInput,
  UpdateStandingInput,
} from "./types";

export const standingsService = {
  getStandings: async (seasonId: string): Promise<StandingsResponse> => {
    const { data } = await apiClient.get<StandingsResponse>(
      `/admin/standings?seasonId=${seasonId}`,
    );
    return data;
  },

  createStanding: async (input: CreateStandingInput): Promise<Standing> => {
    const { data } = await apiClient.post<Standing>("/admin/standings", input);
    return data;
  },

  updateStanding: async (
    id: string,
    input: UpdateStandingInput,
  ): Promise<Standing> => {
    const { data } = await apiClient.patch<Standing>(
      `/admin/standings/${id}`,
      input,
    );
    return data;
  },

  deleteStanding: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/standings/${id}`);
  },
};
