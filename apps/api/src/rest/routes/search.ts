import { Hono } from "hono";
import { typesense } from "@football-intel/search";

const app = new Hono();

app.get("/players", async (c) => {
  const q = c.req.query("q") ?? "*";
  const leagueId = c.req.query("leagueId");
  const seasonId = c.req.query("seasonId");
  const clubId = c.req.query("clubId");
  const nationalityId = c.req.query("nationalityId");

  const filters: string[] = [];
  if (leagueId) filters.push(`leagueId:=${leagueId}`);
  if (seasonId) filters.push(`seasonId:=${seasonId}`);
  if (clubId) filters.push(`clubId:=${clubId}`);
  if (nationalityId) filters.push(`nationalityId:=${nationalityId}`);

  const result = await typesense
    .collections("players")
    .documents()
    .search({
      q,
      query_by: "fullName",
      filter_by: filters.length > 0 ? filters.join(" && ") : undefined,
    });

  return c.json(result);
});

export default app;
