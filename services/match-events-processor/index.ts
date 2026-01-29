import { Worker } from "bullmq";
import { redisConnection, StatsJobs } from "@football-intel/queue";
import { recomputePlayerStats } from "@football-intel/domain";
import { recomputeStandings } from "@football-intel/domain";
import { indexPlayer } from "@football-intel/search";

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
