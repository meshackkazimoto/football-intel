import { apiClient } from "../api-client";
import {
  Match,
  MatchesResponse,
  MatchFilters,
  CreateMatchInput,
  UpdateMatchInput,
} from "./types";

export const matchesService = {
  getMatches: async (filters?: MatchFilters): Promise<MatchesResponse> => {
    const { data } = await apiClient.get<MatchesResponse>("/matches", {
      params: filters,
    });
    return data;
  },

  getMatchById: async (id: string): Promise<Match> => {
    const { data } = await apiClient.get<Match>(`/matches/${id}`);
    return data;
  },

  createMatch: async (input: CreateMatchInput): Promise<Match> => {
    const { data } = await apiClient.post<Match>("/matches", {
      ...input,
      status: input.status || "scheduled",
    });
    return data;
  },

  updateMatch: async (id: string, input: UpdateMatchInput): Promise<Match> => {
    const { data } = await apiClient.patch<Match>(`/matches/${id}`, input);
    return data;
  },

  deleteMatch: async (id: string): Promise<void> => {
    await apiClient.delete(`/matches/${id}`);
  },
};
