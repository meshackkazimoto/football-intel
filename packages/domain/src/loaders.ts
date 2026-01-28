import DataLoader from "dataloader";
import { db } from "@football-intel/db/src/client";
import { teams, clubs } from "@football-intel/db/src/schema/core";
import { inArray } from "drizzle-orm";

export function createLoaders() {
  return {
    teamById: new DataLoader(async (ids: readonly string[]) => {
      const rows = await db
        .select()
        .from(teams)
        .where(inArray(teams.id, [...ids]));

      const map = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => map.get(id) ?? null);
    }),

    clubById: new DataLoader(async (ids: readonly string[]) => {
      const rows = await db
        .select()
        .from(clubs)
        .where(inArray(clubs.id, [...ids]));

      const map = new Map(rows.map((r) => [r.id, r]));
      return ids.map((id) => map.get(id) ?? null);
    })
  };
}

export type Loaders = ReturnType<typeof createLoaders>;