import { typesense } from "./client";

export * from "./client";
export * from "./schema";
export * from "./reindex-players";

export async function indexPlayer(player: any) {
  await typesense
    .collections("players")
    .documents()
    .upsert(player);
}