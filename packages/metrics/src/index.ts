import client from "prom-client";

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const jobsProcessed = new client.Counter({
  name: "jobs_processed_total",
  help: "Total background jobs processed"
});

export const ingestionCounter = new client.Counter({
  name: "ingestions_total",
  help: "Total ingestions received"
});

register.registerMetric(jobsProcessed);
register.registerMetric(ingestionCounter);

export async function metricsHandler() {
  return register.metrics();
}