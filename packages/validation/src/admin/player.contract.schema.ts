import { z } from "zod";

const uuid = z.string().uuid();

export const createPlayerContractSchema = z.object({
  playerId: uuid,
  teamId: uuid,
  position: z.string().min(1).max(50), // GK, DF, MF, FW
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  startDate: z.string().date(),
  endDate: z.string().date().optional(),
});

export const updatePlayerContractSchema = z.object({
  position: z.string().min(1).max(50).optional(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  endDate: z.string().date().optional(),
  isCurrent: z.boolean().optional(),
});