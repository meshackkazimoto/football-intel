import { z } from "zod";

export const createCountrySchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().length(3),
});

export const updateCountrySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().length(3).optional(),
});