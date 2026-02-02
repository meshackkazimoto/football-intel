import { apiClient } from "../api-client";
import {
  Stadium,
  StadiumsResponse,
  CreateStadiumInput,
} from "./types";

export const stadiumsService = {
  getStadiums: async (): Promise<StadiumsResponse> => {
    const { data } = await apiClient.get<StadiumsResponse>(
      "/admin/stadiums",
    );
    return data;
  },

  createStadium: async (
    input: CreateStadiumInput,
  ): Promise<Stadium> => {
    const { data } = await apiClient.post<Stadium>(
      "/admin/stadiums",
      input,
    );
    return data;
  },

  deleteStadium: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/stadiums/${id}`);
  },
};