import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const stadiumSchema = z.object({
  id: uuidSchema,
  name: z.string().min(2),
  city: z.string().nullable(),
  countryId: uuidSchema.nullable(),
  capacity: z.number().int().positive().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  createdAt: z.string(),
});

export const createStadiumSchema = z.object({
  name: z.string().min(2, "Stadium name is required"),
  city: z.string().optional(),
  countryId: uuidSchema.optional(),
  capacity: z.number().int().positive().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export const updateStadiumSchema = createStadiumSchema.partial();

export const stadiumFiltersSchema = z.object({
  search: z.string().optional(),
  countryId: uuidSchema.optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export type Stadium = z.infer<typeof stadiumSchema>;
export type CreateStadiumInput = z.infer<typeof createStadiumSchema>;
export type UpdateStadiumInput = z.infer<typeof updateStadiumSchema>;
export type StadiumFilters = z.infer<typeof stadiumFiltersSchema>;