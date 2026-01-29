import { Worker } from "bullmq";
import { redisConnection, StatsJobs } from "@football-intel/queue";
import { recomputePlayerStats } from "@football-intel/domain";
import { recomputeStandings } from "@football-intel/domain";

new Worker(
  "stats",
  async (job) => {
    switch (job.name) {
      case StatsJobs.RECOMPUTE_STATS:
        await recomputePlayerStats(job.data.matchId);
        break;

      case StatsJobs.RECOMPUTE_STANDINGS:
        await recomputeStandings(job.data.seasonId);
        break;
    }
  },
  { connection: redisConnection }
);