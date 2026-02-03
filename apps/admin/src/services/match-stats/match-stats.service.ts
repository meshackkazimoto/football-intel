import { apiClient } from "../api-client";
import {
  MatchStats,
  UpdateMatchStatsInput,
} from "./types";

export const matchStatsService = {
  upsertStats: async (
    input: UpdateMatchStatsInput,
  ): Promise<{ ok: true }> => {
    const { data } = await apiClient.post(
      "/admin/match-stats",
      input,
    );
    return data;
  },

  getStatsByMatch: async (
    matchId: string,
  ): Promise<MatchStats[]> => {
    const { data } = await apiClient.get(
      `/admin/match-stats?matchId=${matchId}`,
    );
    return data;
  },
};