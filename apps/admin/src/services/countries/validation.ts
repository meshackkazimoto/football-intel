import { z } from "zod";

export const countrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string().length(3),
  createdAt: z.string(),
});

export const createCountrySchema = z.object({
  name: z.string().min(2, "Country name is required").max(100),
  code: z.string().length(3, "ISO-3 country code required"),
});

export const updateCountrySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().length(3).optional(),
});