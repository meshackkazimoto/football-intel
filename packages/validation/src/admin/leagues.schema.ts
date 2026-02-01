import { z } from "zod";

export const CreateLeagueSchema = z.object({
  name: z.string().min(2),
  shortName: z.string().max(20).optional(),
  countryId: z.string().uuid().optional(), // default TZ
  tier: z.number().int().min(1),
  type: z.enum(["league", "cup"]).default("league"),
  numberOfTeams: z.number().int().positive().optional(),
  logo: z.string().url().optional(),
});

export const UpdateLeagueSchema = CreateLeagueSchema.partial().extend({
  id: z.string().uuid(),
});