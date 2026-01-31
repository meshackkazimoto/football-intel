import { Hono } from "hono";
import { metricsHandler } from "@football-intel/metrics";
import { logger } from "@football-intel/logger";
import { requestId } from "src/utils/tracing";
import { Env } from "src/env";

const app = new Hono<Env>();

app.get("/", async (c) => {
  logger.info(`Request ID: ${c.get("requestId")}`);
  return c.text(await metricsHandler());
});

export default app;
