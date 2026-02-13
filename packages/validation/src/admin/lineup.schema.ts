import { z } from "zod";

export const CreateLineupSchema = z.object({
  matchId: z.string().uuid(),
  teamId: z.string().uuid(),
  players: z
    .array(
      z.object({
        playerId: z.string().uuid(),
        position: z.string().min(1),
        isStarting: z.boolean(),
        jerseyNumber: z.number().int().positive().optional(),
      }),
    )
    .min(1),
}).superRefine((data, ctx) => {
  const starters = data.players.filter((p) => p.isStarting).length;
  if (starters !== 11) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Lineup must have exactly 11 starters",
      path: ["players"],
    });
  }

  const playerIds = data.players.map((p) => p.playerId);
  const uniquePlayerIds = new Set(playerIds);
  if (uniquePlayerIds.size !== playerIds.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Lineup contains duplicate playerId",
      path: ["players"],
    });
  }

  const jerseyNumbers = data.players
    .map((p) => p.jerseyNumber)
    .filter((n): n is number => typeof n === "number");
  const uniqueJerseyNumbers = new Set(jerseyNumbers);
  if (uniqueJerseyNumbers.size !== jerseyNumbers.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Lineup contains duplicate jersey numbers",
      path: ["players"],
    });
  }
});

export const UpdateLineupSchema = CreateLineupSchema.partial();
