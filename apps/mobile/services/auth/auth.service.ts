import { api } from '../api';
import type { LoginInput, LoginResponse, MeResponse } from './types';

export const authService = {
  login: async (input: LoginInput): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', input);
    return data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  me: async (): Promise<MeResponse> => {
    const { data } = await api.get<MeResponse>('/auth/me');
    return data;
  },
};
