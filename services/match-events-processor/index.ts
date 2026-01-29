import { Worker } from "bullmq";

new Worker(
  "stats",
  async (job) => {
    if (job.name === "RECOMPUTE_STATS") {
      await recomputePlayerStats(job.data.matchId);
    }

    if (job.name === "RECOMPUTE_STANDINGS") {
      await recomputeStandings(job.data.seasonId);
    }
  },
  { connection: { host: "localhost", port: 6379 } }
);