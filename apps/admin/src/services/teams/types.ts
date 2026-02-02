import { z } from "zod";
import { createTeamSchema, teamSchema } from "./validation";

export type Team = z.infer<typeof teamSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export interface TeamsResponse {
  data: Team[];
  total: number;
}