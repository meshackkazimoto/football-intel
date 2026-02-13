import { api } from '../api';

import type {
  MatchListItem,
  MatchesListResponse,
} from './types/match-list';

import type {
  LiveMatch,
  LiveMatchesResponse,
} from './types/match-live';

import type { MatchDetails } from './types/match-details';

import type { MatchResult } from './types/match-result';

export const matchesService = {
  getToday: async (): Promise<MatchListItem[]> => {
    const { data } = await api.get<MatchListItem[]>('/matches/today');
    return data;
  },

  getUpcoming: async (): Promise<MatchListItem[]> => {
    const { data } = await api.get<MatchListItem[]>('/matches/upcoming');
    return data;
  },

  getRecent: async (): Promise<MatchListItem[]> => {
    const { data } = await api.get<MatchListItem[]>('/matches/recent');
    return data;
  },

  getList: async (
    params?: {
      seasonId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<MatchesListResponse> => {
    const { data } = await api.get<MatchesListResponse>(
      '/matches',
      { params }
    );
    return data;
  },

  getLive: async (
    params?: { seasonId?: string }
  ): Promise<LiveMatchesResponse> => {
    const { data } = await api.get<LiveMatchesResponse>(
      '/matches/live',
      { params }
    );
    return data;
  },

  getDetails: async (id: string): Promise<MatchDetails> => {
    const { data } = await api.get<MatchDetails>(
      `/matches/${id}/details`
    );
    return data;
  },

  getLiveDetails: async (id: string) => {
    const { data } = await api.get(
      `/matches/${id}/live`
    );
    return data;
  },

  getResult: async (id: string): Promise<MatchResult> => {
    const { data } = await api.get<MatchResult>(
      `/matches/${id}/result`
    );
    return data;
  },

  getStats: async (id: string) => {
    const { data } = await api.get(
      `/matches/${id}/stats`
    );
    return data;
  },

  getPrediction: async (id: string) => {
    const { data } = await api.get(
      `/matches/${id}/prediction`
    );
    return data;
  },

  getH2H: async (clubA: string, clubB: string) => {
    const { data } = await api.get('/matches/h2h', {
      params: { clubA, clubB },
    });
    return data;
  },

  getLeagueFixtures: async (seasonId: string): Promise<MatchListItem[]> => {
    const { data } = await api.get<MatchesListResponse>('/matches', {
      params: {
        seasonId,
        status: 'scheduled',
        page: 1,
        limit: 50,
      },
    });
    return data.data;
  },

  getLeagueResults: async (seasonId: string): Promise<MatchListItem[]> => {
    const { data } = await api.get<MatchesListResponse>('/matches', {
      params: {
        seasonId,
        status: 'finished',
        page: 1,
        limit: 50,
      },
    });
    return data.data;
  },
}; 
