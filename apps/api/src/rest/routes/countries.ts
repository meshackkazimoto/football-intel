import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import { createRateLimiter } from "../../middleware/rate-limit";

const app = new Hono();

app.get("/", createRateLimiter(100, 60), async (c) => {
  const data = await db.query.countries.findMany();
  return c.json(data);
});

export default app;
