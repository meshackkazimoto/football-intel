import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { eq, lte } from "drizzle-orm";

export async function autoStartMatches() {
  const now = new Date();

  const scheduled = await db.query.matches.findMany({
    where: eq(matches.status, "scheduled"),
  });

  for (const match of scheduled) {
    if (match.matchDate <= now) {
      await db
        .update(matches)
        .set({
          status: "live",
          startedAt: now,
          currentMinute: 0,
          period: "1H",
        })
        .where(eq(matches.id, match.id));
    }
  }
}