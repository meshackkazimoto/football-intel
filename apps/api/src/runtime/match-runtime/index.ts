import { tickLiveMatches } from "./ticker";

let started = false;

export function startMatchRuntime() {
  if (started) return;
  started = true;

  console.log("⚽ Match runtime started");

  setInterval(async () => {
    try {
      await tickLiveMatches();
    } catch (err) {
      console.error("Match runtime error:", err);
    }
  }, 60_000); // 1 minute
}