import { api } from '../api';
import type { League, LeagueStanding, Season } from './types';

export const leaguesService = {
  getLeagues: async (): Promise<League[]> => {
    const { data } = await api.get<League[]>('/leagues');
    return data;
  },
  getSeasons: async (leagueId: string): Promise<Season[]> => {
    const { data } = await api.get<Season[]>(`/leagues/${leagueId}/seasons`);
    return data;
  },
  getStandings: async (seasonId: string): Promise<LeagueStanding[]> => {
    const { data } = await api.get<LeagueStanding[]>('/leagues/standings', {
      params: { seasonId },
    });
    return data;
  },
};
