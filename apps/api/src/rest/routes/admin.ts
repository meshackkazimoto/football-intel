import { Hono } from "hono";
import { type User, type Session } from "lucia";
import { authMiddleware } from "../../middleware/auth";
import { db } from "@football-intel/db/src/client";
import {
  ingestionLogs,
  verificationRecords,
} from "@football-intel/db/src/schema/ingestion";
import { eq } from "drizzle-orm";
import { StatsJobs, statsQueue } from "@football-intel/queue";

console.log("Admin routes module loading...");

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", authMiddleware);

app.use("*", async (c, next) => {
  console.log(`Admin request: ${c.req.method} ${c.req.path}`);

  // Development bypass for testing
  if (
    process.env.NODE_ENV === "development" &&
    c.req.header("X-Admin-Test-Mode") === "true"
  ) {
    c.set("user", {
      id: "dev-admin-id",
      email: "dev@football-intel.com",
      role: "ADMIN",
    } as any);
    return next();
  }

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  if (user.role !== "ADMIN") {
    return c.json({ error: "Forbidden" }, 403);
  }
  return next();
});

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
    verifierUserId: c.get("user")!.id,
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
