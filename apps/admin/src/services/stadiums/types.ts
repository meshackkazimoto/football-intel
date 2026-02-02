import { z } from "zod";
import { createStadiumSchema, stadiumSchema } from "./validation";

export type Stadium = z.infer<typeof stadiumSchema>;
export type CreateStadiumInput = z.infer<typeof createStadiumSchema>;

export interface StadiumsResponse {
  data: Stadium[];
  total: number;
}