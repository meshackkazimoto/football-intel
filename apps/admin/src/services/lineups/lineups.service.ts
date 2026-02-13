import { apiClient } from "../api-client";
import { CreateLineupInput } from "./types";

export const lineupsService = {
  createLineup: async (input: CreateLineupInput): Promise<{ ok: true }> => {
    const { data } = await apiClient.post<{ ok: true }>(
      "/admin/lineups",
      input,
    );
    return data;
  },
};
