import { z } from "zod";

const leagueSchema = z.object({
  id: z.string().uuid().optional().or(z.string()), 
  name: z.string(),
  createdAt: z.date(),
  countryId: z.string(),
  shortName: z.string().nullable(),
  tier: z.number(),
  type: z.string().nullable(),
  numberOfTeams: z.number().nullable(),
  logo: z.string().nullable(),
});

export const seasonSchema = z.object({
  id: z.string(),
  name: z.string().min(4).max(100),
  createdAt: z.date(), 
  leagueId: z.string().uuid(),
  startDate: z.string().date(),
  endDate: z.string().date(),
  isCurrent: z.boolean(),
  league: leagueSchema,
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