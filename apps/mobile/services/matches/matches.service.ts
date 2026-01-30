import { api } from '../api';
import type { Match, MatchesListResponse } from './types';

export const matchesService = {
  getToday: async (): Promise<Match[]> => {
    const { data } = await api.get<Match[]>('/matches/today');
    return data;
  },
  getUpcoming: async (): Promise<Match[]> => {
    const { data } = await api.get<Match[]>('/matches/upcoming');
    return data;
  },
  getRecent: async (): Promise<Match[]> => {
    const { data } = await api.get<Match[]>('/matches/recent');
    return data;
  },
  getList: async (params?: { seasonId?: string; status?: string; page?: number; limit?: number }): Promise<MatchesListResponse> => {
    const { data } = await api.get<MatchesListResponse>('/matches', { params });
    return data;
  },
  getResult: async (id: string) => {
    const { data } = await api.get(`/matches/${id}/result`);
    return data;
  },
};
