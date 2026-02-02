import { z } from "zod";

export const StandingStatusSchema = z.enum([
  "promotion",
  "relegation",
  "playoff",
  "normal",
]);

export const CreateStandingSchema = z.object({
  seasonId: z.string().uuid(),
  teamId: z.string().uuid(),
  position: z.number().int().min(1),
  played: z.number().int().min(0).default(0),
  wins: z.number().int().min(0).default(0),
  draws: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
  goalsFor: z.number().int().min(0).default(0),
  goalsAgainst: z.number().int().min(0).default(0),
  goalDifference: z.number().int().default(0),
  points: z.number().int().default(0),
  pointsDeduction: z.number().int().default(0),
  status: StandingStatusSchema.optional(),
});

export const UpdateStandingSchema = z.object({
  position: z.number().int().min(1).optional(),
  played: z.number().int().min(0).optional(),
  wins: z.number().int().min(0).optional(),
  draws: z.number().int().min(0).optional(),
  losses: z.number().int().min(0).optional(),
  goalsFor: z.number().int().min(0).optional(),
  goalsAgainst: z.number().int().min(0).optional(),
  goalDifference: z.number().int().optional(),
  points: z.number().int().optional(),
  pointsDeduction: z.number().int().optional(),
  status: StandingStatusSchema.optional(),
});
