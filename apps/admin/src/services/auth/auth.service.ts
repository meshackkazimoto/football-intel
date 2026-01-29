import { apiClient } from "../api-client";
import { LoginInput, LoginResponse, User } from "./types";

export const authService = {
  login: async (credentials: LoginInput): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<{ user: User | null }> => {
    const { data } = await apiClient.get<{ user: User | null }>("/auth/me");
    return data;
  },
};
