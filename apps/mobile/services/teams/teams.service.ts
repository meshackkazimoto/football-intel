import { api } from '../api';

import type { TeamListItem } from './types/team-list';
import type { TeamDetails } from './types/team-details';
import type { TeamStats } from './types/team-stats';
import type { TeamMatch } from './types/team-match';

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

  getDetails: async (id: string): Promise<TeamDetails> => {
    const { data } = await api.get<TeamDetails>(`/teams/${id}/details`);
    return data;
  },

  getStats: async (id: string): Promise<TeamStats> => {
    const { data } = await api.get<TeamStats>(
      `/teams/${id}/stats`
    );
    return data;
  },

  getMatches: async (
    id: string,
    params?: {
      status?:
        | 'scheduled'
        | 'finished'
        | 'live'
        | 'half_time'
        | 'postponed'
        | 'abandoned'
        | 'cancelled';
      limit?: number;
    },
  ): Promise<TeamMatch[]> => {
    const { data } = await api.get<TeamMatch[]>(`/teams/${id}/matches`, { params });
    return data;
  },
};
