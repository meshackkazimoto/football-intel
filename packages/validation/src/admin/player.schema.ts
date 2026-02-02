import { z } from "zod";

const uuid = z.string().uuid();

export const createPlayerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase and dash-separated"),
  dateOfBirth: z.string().date().optional(),
  nationalityId: uuid.optional(),
  preferredFoot: z.enum(["left", "right", "both"]).optional(),
  height: z.number().int().min(100).max(250).optional(),
  metadata: z
    .object({
      jerseyName: z.string().min(1).max(20).optional(),
      nickname: z.string().min(1).max(50).optional(),
    })
    .optional(),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;