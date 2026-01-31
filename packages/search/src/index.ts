import { typesense } from "./client";

export * from "./client";
export * from "./schema";

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