import { Hono } from "hono";
import { type User } from "lucia";
import { db } from "@football-intel/db/src/client";
import {
  ingestionLogs,
  verificationRecords,
} from "@football-intel/db/src/schema/ingestion";

const app = new Hono<{
  Variables: {
    user: User;
  };
}>();

app.post("/ingest", async (c) => {
  const body = await c.req.json();

  const [row] = await db
    .insert(ingestionLogs)
    .values({
      type: body.type,
      source: "ADMIN",
      rawPayload: body.payload,
    })
    .returning();

  return c.json(row);
});

app.post("/verify/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await db.insert(verificationRecords).values({
    ingestionId: id,
    verifierUserId: c.get("user").id,
    confidenceScore: body.score,
    notes: body.notes,
  });

  return c.json({ ok: true });
});

export default app;
