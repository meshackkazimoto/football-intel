import { Hono } from "hono";
import { metricsHandler } from "@football-intel/metrics";
import { logger } from "@football-intel/logger";
import { requestId } from "src/utils/tracing";

const app = new Hono<{
  Variables: {
    requestId: string;
  };
}>();

app.use("*", async (c, next) => {
  const id = requestId();
  c.set("requestId", id);
  await next();
});

app.get("/", async (c) => {
  logger.info(`Request ID: ${c.get("requestId")}`);
  return c.text(await metricsHandler());
});

export default app;
