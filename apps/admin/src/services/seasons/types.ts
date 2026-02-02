import z from "zod";
import { createSeasonSchema, seasonSchema, updateSeasonSchema } from "./validation";

export type Season = z.infer<typeof seasonSchema>;

export interface SeasonsResponse {
  data: Season[];
  total: number;
}

export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;