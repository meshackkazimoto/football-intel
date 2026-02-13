import { db } from "@football-intel/db/src/client";
import { matches } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { StatsJobs, statsQueue } from "@football-intel/queue";
import { RuntimeMatch } from "./types";

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const FIRST_HALF_AUTO_END_MINUTE = toPositiveInt(
  process.env.MATCH_FIRST_HALF_AUTO_END_MINUTE,
  50,
);

const SECOND_HALF_AUTO_END_MINUTE = toPositiveInt(
  process.env.MATCH_SECOND_HALF_AUTO_END_MINUTE,
  95,
);

export async function handleTransitions(match: RuntimeMatch) {
  const minute = match.currentMinute ?? 0;

  if (minute >= FIRST_HALF_AUTO_END_MINUTE && match.period === "1H") {
    await db
      .update(matches)
      .set({
        status: "half_time",
        period: "HT",
        currentMinute: minute,
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

  if (minute >= SECOND_HALF_AUTO_END_MINUTE && match.period === "2H") {
    const [updated] = await db
      .update(matches)
      .set({
        status: "finished",
        period: "FT",
        currentMinute: minute,
        endedAt: new Date(),
      })
      .where(eq(matches.id, match.id))
      .returning({
        id: matches.id,
        seasonId: matches.seasonId,
      });

    if (updated) {
      await statsQueue.add(StatsJobs.RECOMPUTE_STATS, {
        matchId: updated.id,
      });
      await statsQueue.add(StatsJobs.RECOMPUTE_STANDINGS, {
        seasonId: updated.seasonId,
      });
    }
  }
}
