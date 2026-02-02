import { z } from "zod";

export const stadiumSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: z.string().nullable(),
  country: z.object({
    // id: z.string().uuid(),
    name: z.string(),
    code: z.string().nullable(),
    // flagUrl: z.string().nullable(),
  }).nullable(),
  capacity: z.number().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  createdAt: z.string(),
});

export const createStadiumSchema = z.object({
  name: z.string().min(2, "Stadium name is required"),
  city: z.string().optional(),
  countryId: z.string().uuid().optional(),
  capacity: z.number().positive().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});