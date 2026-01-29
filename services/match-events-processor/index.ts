import { Worker } from "bullmq";
import { redisConnection, StatsJobs } from "@football-intel/queue";
import {
  recomputePlayerStats,
  computeMatchStats,
} from "@football-intel/domain";
import { recomputeStandings } from "@football-intel/domain";
import { indexPlayer } from "@football-intel/search";
import { broadcastNotification } from "@football-intel/notifications";

new Worker(
  "stats",
  async (job) => {
    switch (job.name) {
      case StatsJobs.RECOMPUTE_STATS:
        await recomputePlayerStats(job.data.matchId);
        await computeMatchStats(job.data.matchId);
        // Alert for goal events (simplified)
        await broadcastNotification("goal", { matchId: job.data.matchId });
        break;

      case StatsJobs.RECOMPUTE_STANDINGS:
        await recomputeStandings(job.data.seasonId);
        await broadcastNotification("standings_change", {
          seasonId: job.data.seasonId,
        });
        break;

      case StatsJobs.INDEX_PLAYER:
        await indexPlayer({
          id: job.data.id,
          fullName: job.data.fullName,
          clubName: job.data.clubName,
        });
        break;
    }

    console.log("JOB RECEIVED:", job.name, job.data);
  },
  { connection: redisConnection },
);
