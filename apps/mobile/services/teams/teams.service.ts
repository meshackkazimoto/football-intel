import { api } from '../api';

import type { TeamListItem } from './types/team-list';
import type { TeamDetails } from './types/team-details';
import type { TeamStats } from './types/team-stats';

export const teamsService = {
  getList: async (
    params?: { seasonId?: string }
  ): Promise<TeamListItem[]> => {
    const { data } = await api.get<TeamListItem[]>(
      '/teams',
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<TeamDetails> => {
    const { data } = await api.get<TeamDetails>(
      `/teams/${id}`
    );
    return data;
  },

  getStats: async (id: string): Promise<TeamStats> => {
    const { data } = await api.get<TeamStats>(
      `/teams/${id}/stats`
    );
    return data;
  },
};