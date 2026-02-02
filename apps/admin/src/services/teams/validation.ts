import { z } from "zod";

const metadataSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
  }).optional(),
  nickname: z.string().optional(),
});

const clubSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  countryId: z.string(),
  slug: z.string(),
  foundedYear: z.number().nullable(),
  stadiumName: z.string().nullable(),
  stadiumCapacity: z.number().nullable(),
  stadiumId: z.string().nullable(),
  isActive: z.boolean(),
  metadata: metadataSchema.nullable(),
});

const seasonNestedSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  leagueId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean(),
});

export const teamSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(200),
  createdAt: z.date(),
  clubId: z.string().uuid(),
  seasonId: z.string().uuid(),
  club: clubSchema,
  season: seasonNestedSchema,
});

export const createTeamSchema = z.object({
  clubId: z.string().uuid(),
  seasonId: z.string().uuid(),
  name: z.string().min(2).max(200),
});

export const updateTeamSchema = z.object({
  name: z.string().min(2).max(200).optional(),
});