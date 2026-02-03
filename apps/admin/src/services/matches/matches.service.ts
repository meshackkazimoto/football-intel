import { apiClient } from "../api-client";
import {
  Match,
  MatchesResponse,
  MatchFilters,
  CreateMatchInput,
  MatchStatus,
} from "./types";

export const matchesService = {
  getMatches: async (filters?: MatchFilters): Promise<MatchesResponse> => {
    const { data } = await apiClient.get<MatchesResponse>(
      "/admin/fixtures",
      { params: filters },
    );
    return data;
  },

  getMatchById: async (id: string): Promise<Match> => {
    const { data } = await apiClient.get<Match>(
      `/admin/fixtures/${id}`,
    );
    return data;
  },

  createMatch: async (input: CreateMatchInput): Promise<Match> => {
    const { data } = await apiClient.post<Match>(
      "/admin/fixtures",
      {
        ...input,
        // status: input.status ?? "scheduled",
      },
    );
    return data;
  },

  updateMatch: async (
    id: string,
    input: {
      status?: MatchStatus;
      venue?: string;
      homeScore?: number;
      awayScore?: number;
      currentMinute?: number;
      period?: "1H" | "HT" | "2H" | "FT";
      matchDate?: string;
      startedAt?: string;
      endedAt?: string;
    },
  ): Promise<Match> => {
    const { data } = await apiClient.patch<Match>(
      `/admin/fixtures/${id}`,
      input,
    );
    return data;
  },

  deleteMatch: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/fixtures/${id}`);
  },
};