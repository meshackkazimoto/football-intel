import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { clubs, countries } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import {
  createClubSchema,
  updateClubSchema,
} from "@football-intel/validation";
import { auditLog } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
  Variables: {
    user: User;
    session: Session;
  };
}>();

app.use("*", requireRole(["ADMIN"]));

app.get("/", async (c) => {
  const list = await db.query.clubs.findMany({
    with: {
      country: true,
    },
    orderBy: (clubs, { asc }) => [asc(clubs.name)],
  });

  return c.json(list);
});

app.post("/", async (c) => {
  const body = createClubSchema.parse(await c.req.json());

  let countryId = body.countryId;
  if (!countryId) {
    const tza = await db.query.countries.findFirst({
      where: eq(countries.code, "TZA"),
    });
    countryId = tza?.id;
  }

  if (!countryId) {
    return c.json({ error: "Country not found" }, 400);
  }

  const [created] = await db
    .insert(clubs)
    .values({
      ...body,
      countryId,
    })
    .returning();

  auditLog({
    action: "CREATE",
    entity: "CLUB",
    entityId: created.id,
    userId: c.get("user").id,
  });

  return c.json(created, 201);
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = updateClubSchema.parse(await c.req.json());

  const [updated] = await db
    .update(clubs)
    .set(body)
    .where(eq(clubs.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Club not found" }, 404);
  }

  auditLog({
    action: "UPDATE",
    entity: "CLUB",
    entityId: id,
    userId: c.get("user").id,
    metadata: body,
  });

  return c.json(updated);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [disabled] = await db
    .update(clubs)
    .set({ isActive: false })
    .where(eq(clubs.id, id))
    .returning();

  if (!disabled) {
    return c.json({ error: "Club not found" }, 404);
  }

  auditLog({
    action: "DISABLE",
    entity: "CLUB",
    entityId: id,
    userId: c.get("user").id,
  });

  return c.json({ ok: true });
});

export default app;