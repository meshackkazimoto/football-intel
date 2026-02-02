import { z } from "zod";

// Ingestion Log Schema
export const ingestionLogSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["MATCH", "PLAYER", "CLUB", "MATCH_EVENT", "LEAGUE", "SEASON"]),
  source: z.string(),
  rawPayload: z.any(),
  status: z.enum(["pending", "verified", "rejected"]),
  createdAt: z.string(),
});

export type IngestionLog = z.infer<typeof ingestionLogSchema>;

export interface IngestionLogsResponse {
  data: IngestionLog[];
  total: number;
}

export interface IngestionFilters {
  status?: "pending" | "verified" | "rejected";
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateIngestionInput {
  type: IngestionLog["type"];
  payload: any;
}

export interface VerifyIngestionInput {
  score: number;
  notes?: string;
}