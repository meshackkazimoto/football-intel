import { Hono } from "hono";
import { typesense } from "@football-intel/search";

const app = new Hono();

app.get("/players", async (c) => {
  const q = c.req.query("q") ?? "";

  const result = await typesense
    .collections("players")
    .documents()
    .search({
      q,
      query_by: "fullName"
    });

  return c.json(result);
});

export default app;
