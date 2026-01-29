import { z } from "zod";

export const clubSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  foundedYear: z.number().nullable(),
  stadiumName: z.string().nullable(),
  stadiumCapacity: z.number().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
});

export const createClubSchema = z.object({
  name: z.string().min(2, "Club name is required"),
  slug: z.string().optional(),
  foundedYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  stadiumName: z.string().optional(),
  stadiumCapacity: z.number().int().positive().optional(),
  countryId: z.string().uuid().optional(),
});

export const updateClubSchema = createClubSchema.partial();

export type Club = z.infer<typeof clubSchema>;
export type CreateClubInput = z.infer<typeof createClubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;

export interface ClubsResponse {
  clubs: Club[];
  total: number;
}

export interface ClubFilters {
  search?: string;
  countryId?: string;
  page?: number;
  limit?: number;
}
