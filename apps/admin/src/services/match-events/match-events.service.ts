import { apiClient } from "../api-client";
import {
  CreateMatchEventInput,
  MatchEvent,
} from "./types";

export const matchEventsService = {
  createEvent: async (
    input: CreateMatchEventInput,
  ): Promise<{ ok: true }> => {
    const { data } = await apiClient.post(
      "/admin/match-events",
      input,
    );
    return data;
  },

  getEventsByMatch: async (
    matchId: string,
  ): Promise<MatchEvent[]> => {
    const { data } = await apiClient.get(
      `/admin/match-events?matchId=${matchId}`,
    );
    return data;
  },
};