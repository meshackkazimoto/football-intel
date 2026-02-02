import { z } from "zod";

export const createPlayerSchema = z.object({
  fullName: z.string().min(2),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  slug: z.string().min(2),
  dateOfBirth: z.string().optional(),
  nationalityId: z.string().uuid().optional(),
  preferredFoot: z.enum(["left", "right", "both"]).optional(),
  height: z.number().int().positive().optional(),
});

export const updatePlayerSchema = createPlayerSchema.partial();