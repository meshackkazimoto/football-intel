import { apiClient } from '../api-client';
import { Player, PlayersResponse } from './types';

export const playersService = {
  getPlayers: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PlayersResponse> => {
    return apiClient.get<PlayersResponse>('/players', params);
  },

  getPlayerById: async (id: string): Promise<Player> => {
    return apiClient.get<Player>(`/players/${id}`);
  },
};
