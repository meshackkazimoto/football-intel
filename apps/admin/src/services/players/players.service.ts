import { apiClient } from "../api-client";
import {
  Country,
  Player,
  PlayersResponse,
  PlayerFilters,
  CreatePlayerInput,
  UpdatePlayerInput,
} from "./types";

export const playersService = {
  getPlayers: async (filters?: PlayerFilters): Promise<PlayersResponse> => {
    const { data } = await apiClient.get<PlayersResponse>(
      "/admin/players",
      { params: filters },
    );
    return data;
  },

  getPlayerById: async (id: string): Promise<Player> => {
    const { data } = await apiClient.get<Player>(
      `/admin/players/${id}`,
    );
    return data;
  },

  getNationalities: async (): Promise<{ data: Country[] }> => {
    const { data } = await apiClient.get<{ data: Country[] }>(
      "/admin/players/nationalities",
    );
    return data;
  },

  createPlayer: async (
    input: CreatePlayerInput,
  ): Promise<Player> => {
    const { data } = await apiClient.post<Player>(
      "/admin/players",
      input,
    );
    return data;
  },

  updatePlayer: async (
    id: string,
    input: UpdatePlayerInput,
  ): Promise<Player> => {
    const { data } = await apiClient.patch<Player>(
      `/admin/players/${id}`,
      input,
    );
    return data;
  },

  deletePlayer: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/players/${id}`);
  },
};
