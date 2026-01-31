import { api } from '../api';
import type {
  ClubListItem,
  ClubDetails,
  ClubWithCurrentTeam,
} from './types';

export const clubsService = {
  getList: async (): Promise<ClubListItem[]> => {
    const { data } = await api.get<ClubListItem[]>('/clubs');
    return data;
  },

  getById: async (id: string): Promise<ClubDetails> => {
    const { data } = await api.get<ClubDetails>(`/clubs/${id}`);
    return data;
  },

  getCurrentTeam: async (clubId: string): Promise<ClubWithCurrentTeam> => {
    const { data } = await api.get<ClubWithCurrentTeam>(
      `/clubs/${clubId}/current-team`
    );
    return data;
  },
};