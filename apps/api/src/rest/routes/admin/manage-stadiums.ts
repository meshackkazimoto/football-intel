import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import { stadiums } from "@football-intel/db/src/schema/core";
import { eq, ilike } from "drizzle-orm";
import {
  createStadiumSchema,
  updateStadiumSchema,
  stadiumFiltersSchema,
} from "@football-intel/validation";
import { requireRole } from "src/middleware/require-role";

const app = new Hono();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]));

app.get("/", async (c) => {
  const filters = stadiumFiltersSchema.parse(c.req.query());

  const data = await db.query.stadiums.findMany({
    where: filters.search
      ? ilike(stadiums.name, `%${filters.search}%`)
      : undefined,
    orderBy: (s, { asc }) => [asc(s.name)],
  });

  return c.json({
    data,
    total: data.length,
  });
});

app.post("/", async (c) => {
  const body = createStadiumSchema.parse(await c.req.json());

  const [stadium] = await db
    .insert(stadiums)
    .values(body)
    .returning();

  return c.json(stadium, 201);
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateStadiumSchema.parse(await c.req.json());

  const [updated] = await db
    .update(stadiums)
    .set(body)
    .where(eq(stadiums.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Stadium not found" }, 404);
  }

  return c.json(updated);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  await db.delete(stadiums).where(eq(stadiums.id, id));

  return c.json({ ok: true });
});

export default app;