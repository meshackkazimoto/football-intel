import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { RuntimeMatch } from "./types";

export async function handleTransitions(match: RuntimeMatch) {
  const minute = match.currentMinute ?? 0;

  if (minute === 45 && match.period === "1H") {
    await db
      .update(matches)
      .set({
        status: "half_time",
        period: "HT",
        currentMinute: 45,
      })
      .where(eq(matches.id, match.id));
    return;
  }

  if (minute === 46 && match.period === "HT") {
    await db
      .update(matches)
      .set({
        status: "live",
        period: "2H",
        currentMinute: 46,
      })
      .where(eq(matches.id, match.id));
    return;
  }

  if (minute >= 90 && match.period === "2H") {
    await db
      .update(matches)
      .set({
        status: "finished",
        period: "FT",
        currentMinute: 90,
        endedAt: new Date(),
      })
      .where(eq(matches.id, match.id));
  }
}