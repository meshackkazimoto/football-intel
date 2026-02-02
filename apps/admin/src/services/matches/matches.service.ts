import { apiClient } from "../api-client";
import {
  Match,
  MatchesResponse,
  MatchFilters,
  CreateMatchInput,
} from "./types";

export const matchesService = {
  getMatches: async (filters?: MatchFilters): Promise<MatchesResponse> => {
    // We map to /admin/fixtures because that handles all match queries
    const { data } = await apiClient.get<MatchesResponse>("/admin/fixtures", {
      params: filters,
    });
    return data;
  },

  getMatchById: async (id: string): Promise<Match> => {
    const { data } = await apiClient.get<Match>(`/admin/fixtures/${id}`);
    return data;
  },

  createMatch: async (input: CreateMatchInput): Promise<Match> => {
    const { data } = await apiClient.post<Match>("/admin/fixtures", {
      ...input,
      status: input.status || "scheduled",
    });
    return data;
  },

  deleteMatch: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/fixtures/${id}`);
  },
};
