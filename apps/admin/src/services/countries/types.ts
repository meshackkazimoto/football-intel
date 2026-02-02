import { z } from "zod";
import {
  countrySchema,
  createCountrySchema,
  updateCountrySchema,
} from "./validation";

export type Country = z.infer<typeof countrySchema>;
export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;