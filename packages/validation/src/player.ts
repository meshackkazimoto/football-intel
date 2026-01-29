import { z } from "zod";

export const playerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  nationalityId: z.string().uuid()
});