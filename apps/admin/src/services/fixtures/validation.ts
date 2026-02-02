import { z } from "zod";

export const createFixtureSchema = z
    .object({
        seasonId: z.string().uuid("Season is required"),
        homeTeamId: z.string().uuid("Home team is required"),
        awayTeamId: z.string().uuid("Away team is required"),
        matchDate: z
            .string()
            .min(1, "Match date is required")
            .transform((value) => new Date(value).toISOString()),
        venue: z.string().max(200).optional(),
    })
    .refine((data) => data.homeTeamId !== data.awayTeamId, {
        message: "Home and away teams must be different",
        path: ["awayTeamId"],
    });

export const updateFixtureSchema = z.object({
    status: z.enum([
        "scheduled",
        "live",
        "half_time",
        "finished",
        "postponed",
    ]).optional(),

    matchDate: z.string().datetime().optional(),
    venue: z.string().max(200).optional(),

    homeScore: z.number().int().min(0).optional(),
    awayScore: z.number().int().min(0).optional(),

    currentMinute: z.number().int().min(0).max(130).optional(),
    period: z.enum(["1H", "HT", "2H", "FT"]).optional(),

    startedAt: z.string().datetime().optional(),
    endedAt: z.string().datetime().optional(),
});