import { logger } from "@football-intel/logger";
import { apiClient } from "../api-client";
import {
  Player,
  PlayersResponse,
  PlayerFilters,
  CreatePlayerInput,
  UpdatePlayerInput,
} from "./types";

export const playersService = {
  getPlayers: async (filters?: PlayerFilters): Promise<PlayersResponse> => {
    const { data } = await apiClient.get<PlayersResponse>("/players", {
      params: filters,
    });
    
    if (!data) {
      logger.error("Players API returned undefined data");
      throw new Error("Failed to fetch players: No data returned");
    }
    
    logger.info(`Fetched ${data.players?.length || 0} players`);
    return data;
  },

  getPlayerById: async (id: string): Promise<Player> => {
    const { data } = await apiClient.get<Player>(`/players/${id}`);
    return data;
  },

  createPlayer: async (input: CreatePlayerInput): Promise<Player> => {
    const { data } = await apiClient.post<Player>("/players", input);
    return data;
  },

  updatePlayer: async (
    id: string,
    input: UpdatePlayerInput,
  ): Promise<Player> => {
    const { data } = await apiClient.patch<Player>(`/players/${id}`, input);
    return data;
  },

  deletePlayer: async (id: string): Promise<void> => {
    await apiClient.delete(`/players/${id}`);
  },
};
