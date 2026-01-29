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
