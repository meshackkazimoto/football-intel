export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  foundedYear: number | null;
  stadiumName: string | null;
  stadiumCapacity: number | null;
  isActive: boolean;
  country: Country;
}
export interface CreateClubInput {
  name: string;
  slug?: string;
  foundedYear?: number;
  stadiumName?: string;
  stadiumCapacity?: number;
  countryId?: string;
}

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
  stadiumName: z.string().optional(),
  stadiumCapacity: z.number().int().positive().optional(),
  countryId: z.string().uuid().optional(),
});

export const updateClubSchema = createClubSchema.partial();