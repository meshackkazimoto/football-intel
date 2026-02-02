import { z } from "zod";

const clubBaseSchema = {
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
  countryId: z.string().uuid().optional(),
  foundedYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  stadiumId: z.string().uuid().optional(),
  stadiumName: z.string().max(200).optional(),
  stadiumCapacity: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  metadata: z
    .object({
      nickname: z.string().max(100).optional(),
      colors: z
        .object({
          primary: z.string().max(50),
          secondary: z.string().max(50),
        })
        .optional(),
    })
    .optional(),
};

export const createClubSchema = z.object({
  ...clubBaseSchema,
  name: clubBaseSchema.name,
  slug: clubBaseSchema.slug,
});

export const updateClubSchema = z.object(clubBaseSchema).partial();

export const listClubQuerySchema = z.object({
  countryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});
