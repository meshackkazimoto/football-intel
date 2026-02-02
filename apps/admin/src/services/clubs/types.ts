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
  stadium?: {
    id: string;
    name: string;
    capacity: number | null;
  } | null;
  metadata?: {
    nickname?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}
export interface CreateClubInput {
  name: string;
  slug?: string;
  foundedYear?: number;
  countryId?: string;
  stadiumId?: string;
  metadata?: {
    nickname?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
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
