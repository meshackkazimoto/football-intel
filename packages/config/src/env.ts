import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
    DATABASE_URL: z.string().url(),
    SESSION_SECRET: z.string().min(32)
});

export const env = envSchema.parse(process.env);
