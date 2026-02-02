import { z } from "zod";

export const createClubSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  foundedYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  countryId: z.string().uuid().optional(),
  stadiumId: z.string().uuid().optional(),
  metadata: z
    .object({
      nickname: z.string().optional(),
      colors: z
        .object({
          primary: z.string(),
          secondary: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export const updateClubSchema = createClubSchema.partial();
