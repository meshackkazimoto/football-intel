import { z } from "zod";

export const createFixtureSchema = z.object({
    seasonId: z.string().uuid(),
    homeTeamId: z.string().uuid(),
    awayTeamId: z.string().uuid(),
    matchDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v))),
    venue: z.string().max(200).optional(),
});

export const updateFixtureSchema = z.object({
    status: z
        .enum([
            "scheduled",
            "live",
            "half_time",
            "finished",
            "postponed",
        ])
        .optional(),
    matchDate: z.string().datetime().optional(),
    venue: z.string().max(200).optional(),
    homeScore: z.number().int().min(0).optional(),
    awayScore: z.number().int().min(0).optional(),
    currentMinute: z.number().int().min(0).max(130).optional(),
    period: z.enum(["1H", "HT", "2H", "FT"]).optional(),
    startedAt: z.string().datetime().optional(),
    endedAt: z.string().datetime().optional(),
});