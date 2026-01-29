import { Hono } from "hono";
import { type User } from "lucia";
import { db } from "@football-intel/db/src/client";
import {
  ingestionLogs,
  verificationRecords,
} from "@football-intel/db/src/schema/ingestion";
import { eq } from "drizzle-orm";
import { StatsJobs, statsQueue } from "@football-intel/queue";

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

  // 1. Save verification record
  await db.insert(verificationRecords).values({
    ingestionId: id,
    verifierUserId: c.get("user").id,
    confidenceScore: body.score,
    notes: body.notes,
  });

  // 2. Mark ingestion as verified
  const [ingestion] = await db
    .update(ingestionLogs)
    .set({ status: "verified" })
    .where(eq(ingestionLogs.id, id))
    .returning();

  if (!ingestion) {
    return c.json({ error: "Ingestion not found" }, 404);
  }

  // 3. Dispatch queue job depending on type
  const payload = ingestion.rawPayload as {
    matchId?: string;
    seasonId?: string;
  };

  switch (ingestion.type) {
    case "MATCH_EVENT":
      if (payload.matchId) {
        await statsQueue.add(StatsJobs.RECOMPUTE_STATS, {
          matchId: payload.matchId,
        });
      }
      break;

    case "MATCH":
      if (payload.seasonId) {
        await statsQueue.add(StatsJobs.RECOMPUTE_STANDINGS, {
          seasonId: payload.seasonId,
        });
      }
      break;
  }

  return c.json({ ok: true });
});

export default app;
