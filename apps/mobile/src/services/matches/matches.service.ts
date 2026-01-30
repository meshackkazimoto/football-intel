import { apiClient } from '../api-client';
import { Match, MatchesResponse, MatchResult } from './types';

export const matchesService = {
  getMatches: async (params?: {
    seasonId?: string;
    status?: 'scheduled' | 'finished';
    page?: number;
    limit?: number;
  }): Promise<MatchesResponse> => {
    return apiClient.get<MatchesResponse>('/matches', params);
  },

  getTodayMatches: async (): Promise<MatchesResponse> => {
    return apiClient.get<MatchesResponse>('/matches/today');
  },

  getUpcomingMatches: async (): Promise<MatchesResponse> => {
    return apiClient.get<MatchesResponse>('/matches/upcoming');
  },

  getMatchResult: async (id: string): Promise<MatchResult> => {
    return apiClient.get<MatchResult>(`/matches/${id}/result`);
  },

  getMatchById: async (id: string): Promise<Match> => {
    return apiClient.get<Match>(`/matches/${id}`);
  },
};
