import { z } from "zod";

// Ingestion Log Schema
export const ingestionLogSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["MATCH", "PLAYER", "CLUB", "MATCH_EVENT", "LEAGUE", "SEASON"]),
  source: z.string(),
  rawPayload: z.any(),
  status: z.enum(["pending", "verified", "rejected"]).default("pending"),
  createdAt: z.string(),
});

export const createIngestionSchema = z.object({
  type: z.enum(["MATCH", "PLAYER", "CLUB", "MATCH_EVENT", "LEAGUE", "SEASON"]),
  payload: z.any(),
});

export const verifyIngestionSchema = z.object({
  score: z.number().min(0).max(1),
  notes: z.string().optional(),
});

// Verification Record Schema
export const verificationRecordSchema = z.object({
  id: z.string().uuid(),
  ingestionId: z.string().uuid(),
  verifierUserId: z.string().uuid(),
  confidenceScore: z.number(),
  notes: z.string().nullable(),
  createdAt: z.string(),
});

export type IngestionLog = z.infer<typeof ingestionLogSchema>;
export type CreateIngestionInput = z.infer<typeof createIngestionSchema>;
export type VerifyIngestionInput = z.infer<typeof verifyIngestionSchema>;
export type VerificationRecord = z.infer<typeof verificationRecordSchema>;

export interface IngestionLogsResponse {
  logs: IngestionLog[];
  total: number;
}

export interface IngestionFilters {
  status?: "pending" | "verified" | "rejected";
  type?: string;
  page?: number;
  limit?: number;
}
