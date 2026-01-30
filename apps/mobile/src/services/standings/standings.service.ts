import { apiClient } from '../api-client';
import { Standing } from './types';

export const standingsService = {
  getStandings: async (seasonId: string): Promise<Standing[]> => {
    return apiClient.get<Standing[]>('/leagues/standings', { seasonId });
  },
};
