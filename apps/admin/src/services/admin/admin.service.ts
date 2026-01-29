import { apiClient } from "../api-client";
import {
  IngestionLog,
  IngestionLogsResponse,
  IngestionFilters,
  CreateIngestionInput,
  VerifyIngestionInput,
} from "./types";

export const adminService = {
  // Ingestion Logs
  getIngestionLogs: async (
    filters?: IngestionFilters,
  ): Promise<IngestionLogsResponse> => {
    const { data } = await apiClient.get<IngestionLogsResponse>(
      "/admin/ingestion-logs",
      {
        params: filters,
      },
    );
    return data;
  },

  createIngestion: async (
    input: CreateIngestionInput,
  ): Promise<IngestionLog> => {
    const { data } = await apiClient.post<IngestionLog>("/admin/ingest", input);
    return data;
  },

  verifyIngestion: async (
    id: string,
    input: VerifyIngestionInput,
  ): Promise<void> => {
    await apiClient.post(`/admin/verify/${id}`, input);
  },

  rejectIngestion: async (id: string, reason?: string): Promise<void> => {
    await apiClient.post(`/admin/reject/${id}`, { reason });
  },
};
