import { apiClient } from "../api-client";
import {
  CreatePlayerContractInput,
  PlayerContract,
  PlayerContractFilters,
} from "./types";

export const playerContractsService = {
  getContracts: async (
    filters?: PlayerContractFilters,
  ): Promise<PlayerContract[]> => {
    const { data } = await apiClient.get<PlayerContract[]>(
      "/admin/player-contracts",
      { params: filters },
    );
    return data;
  },

  createContract: async (
    input: CreatePlayerContractInput,
  ): Promise<PlayerContract> => {
    const { data } = await apiClient.post<PlayerContract>(
      "/admin/player-contracts",
      input,
    );
    return data;
  },

  deleteContract: async (
    id: string,
  ): Promise<{ ok: boolean; mode?: string; contract?: PlayerContract }> => {
    const { data } = await apiClient.delete(
      `/admin/player-contracts/${id}`,
    );
    return data;
  },
};
