import { typesense } from "./client";

export * from "./client";
export * from "./schema";
export * from "./reindex-players";
export * from "./reindex-teams";

export async function indexPlayer(player: any) {
  await typesense
    .collections("players")
    .documents()
    .upsert(player);
}

export async function indexTeam(team: any) {
  await typesense
    .collections("teams")
    .documents()
    .upsert(team);
}