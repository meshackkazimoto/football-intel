import { apiClient } from "../api-client";
import type {
  MatchPossession,
  UpsertMatchPossessionInput,
} from "./types";

export const matchPossessionsService = {
  getByMatch: async (matchId: string): Promise<MatchPossession[]> => {
    const { data } = await apiClient.get<MatchPossession[]>(
      `/admin/match-possessions?matchId=${matchId}`,
    );
    return data;
  },

  upsert: async (
    input: UpsertMatchPossessionInput,
  ): Promise<{ ok: true; changed: boolean; second: number }> => {
    const { data } = await apiClient.post<{ ok: true; changed: boolean; second: number }>(
      "/admin/match-possessions",
      input,
    );
    return data;
  },
};
