import { z } from "zod";

export const playerSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  nationality: z.string().nullable(),
  position: z.string().nullable(),
  jerseyNumber: z.number().nullable(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  clubName: z.string().nullable(),
});

export const createPlayerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationalityId: z.string().uuid().optional(),
  position: z.string().optional(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export type Player = z.infer<typeof playerSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;

export interface PlayersResponse {
  players: Player[];
  total: number;
}

export interface PlayerFilters {
  search?: string;
  clubId?: string;
  position?: string;
  page?: number;
  limit?: number;
}
