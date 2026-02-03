import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { handleTransitions } from "./transitions";
import { isMatchStatus, isMatchPeriod } from "./guards";
import type { RuntimeMatch } from "./types";

export async function tickLiveMatches() {
  const liveMatches = await db.query.matches.findMany({
    where: eq(matches.status, "live"),
  });

  for (const match of liveMatches) {
    if (match.currentMinute === null) continue;

    if (!isMatchStatus(match.status)) continue;

    const period = isMatchPeriod(match.period)
      ? match.period
      : null;

    const nextMinute = match.currentMinute + 1;

    await db
      .update(matches)
      .set({ currentMinute: nextMinute })
      .where(eq(matches.id, match.id));

    const runtimeMatch: RuntimeMatch = {
      id: match.id,
      status: match.status,
      currentMinute: nextMinute,
      startedAt: match.startedAt,
      period,
    };

    await handleTransitions(runtimeMatch);
  }
}