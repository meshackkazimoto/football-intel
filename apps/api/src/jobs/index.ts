import cron from "node-cron";
import { tickLiveMatches } from "./match-minute-ticker";
import { autoStartMatches } from "./auto-start-matches";

export function registerMatchJobs() {
  cron.schedule("* * * * *", async () => {
    await tickLiveMatches();
    await autoStartMatches();
  });
}