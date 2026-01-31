import { api } from '../api';

import type { League } from './types/league';
import type { Season } from './types/season';
import type { LeagueStandingsResponse } from './types/league-standings';

export const leaguesService = {
  getLeagues: async (): Promise<League[]> => {
    const { data } = await api.get<League[]>('/leagues');
    return data;
  },

  getSeasons: async (leagueId: string): Promise<Season[]> => {
    const { data } = await api.get<Season[]>(
      `/leagues/${leagueId}/seasons`
    );
    return data;
  },

  getStandings: async (
    seasonId: string
  ): Promise<LeagueStandingsResponse> => {
    const { data } = await api.get<LeagueStandingsResponse>(
      '/leagues/standings',
      { params: { seasonId } }
    );
    return data;
  },
};