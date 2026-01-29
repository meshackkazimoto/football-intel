import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export const statsQueue = new Queue("stats", {
  connection: redisConnection
});

export const StatsJobs = {
  RECOMPUTE_STATS: "RECOMPUTE_STATS",
  RECOMPUTE_STANDINGS: "RECOMPUTE_STANDINGS"
};