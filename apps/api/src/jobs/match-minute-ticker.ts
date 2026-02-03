import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";

export async function tickLiveMatches() {
  const liveMatches = await db.query.matches.findMany({
    where: eq(matches.status, "live"),
  });

  for (const match of liveMatches) {
    if (match.currentMinute === null) continue;

    const nextMinute = match.currentMinute + 1;

    if (nextMinute === 45) {
      await db
        .update(matches)
        .set({
          status: "half_time",
          period: "HT",
          currentMinute: 45,
        })
        .where(eq(matches.id, match.id));
      continue;
    }

    if (nextMinute > 90) continue;

    await db
      .update(matches)
      .set({
        currentMinute: nextMinute,
      })
      .where(eq(matches.id, match.id));
  }
}