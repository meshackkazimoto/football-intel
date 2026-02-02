import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import { players, countries } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import {
  createPlayerSchema,
  updatePlayerSchema,
} from "@football-intel/validation";
import { requireRole } from "src/middleware/require-role";
import { logger } from "@football-intel/logger";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN", "MODERATOR"]));

app.get("/", async (c) => {
  const data = await db.query.players.findMany({
    with: {
      nationality: true,
    },
    orderBy: (p, { asc }) => [asc(p.fullName)],
  });

  return c.json(data);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const player = await db.query.players.findFirst({
    where: eq(players.id, id),
    with: {
      nationality: true,
    },
  });

  if (!player) {
    return c.json({ error: "Player not found" }, 404);
  }

  return c.json(player);
});

app.post("/", async (c) => {
  const parsed = createPlayerSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const {
    nationalityId,
    firstName,
    lastName,
    fullName,
    ...rest
  } = parsed.data;

  // Validate nationality if provided
  if (nationalityId) {
    const country = await db.query.countries.findFirst({
      where: eq(countries.id, nationalityId),
    });
    if (!country) {
      return c.json({ error: "Nationality not found" }, 400);
    }
  }

  const [created] = await db
    .insert(players)
    .values({
      firstName,
      lastName,
      fullName,
      nationalityId,
      ...rest,
    })
    .returning();

  logger.info(
    {
      action: "CREATE_PLAYER",
      playerId: created.id,
      by: c.get("user")?.id,
      role: c.get("user")?.role,
    },
    "Player created",
  );

  return c.json(created, 201);
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");

  const parsed = updatePlayerSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const existing = await db.query.players.findFirst({
    where: eq(players.id, id),
  });

  if (!existing) {
    return c.json({ error: "Player not found" }, 404);
  }

  const [updated] = await db
    .update(players)
    .set(parsed.data)
    .where(eq(players.id, id))
    .returning();

  logger.info(
    {
      action: "UPDATE_PLAYER",
      playerId: id,
      by: c.get("user")?.id,
      role: c.get("user")?.role,
      changes: parsed.data,
    },
    "Player updated",
  );

  return c.json(updated);
});

app.delete("/:id", requireRole(["ADMIN"]), async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(players)
    .where(eq(players.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Player not found" }, 404);
  }

  logger.warn(
    {
      action: "DELETE_PLAYER",
      playerId: id,
      by: c.get("user")?.id,
    },
    "Player deleted",
  );

  return c.json({ ok: true });
});

export default app;