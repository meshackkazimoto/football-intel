import { z } from "zod";

export const seasonSchema = z.object({
  leagueId: z.string().uuid(),
  name: z.string().min(4).max(100), // e.g. 2024/25
  startDate: z.string().date(),
  endDate: z.string().date(),
  isCurrent: z.boolean().optional(),
});

export const createSeasonSchema = z.object({
  leagueId: z.string().uuid(),
  name: z.string().min(4).max(100), // e.g. 2024/25
  startDate: z.string().date(),
  endDate: z.string().date(),
  isCurrent: z.boolean().optional(),
});

export const updateSeasonSchema = z.object({
  name: z.string().min(4).max(100).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  isCurrent: z.boolean().optional(),
});