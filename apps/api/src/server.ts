import dotenv from "dotenv";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { yoga } from "./graphql/server";
import { logger } from "@football-intel/logger";
import { logger as honoLogger } from "hono/logger";
import { createRateLimiter } from "./middleware/rate-limit";
import { requestId } from "./utils/tracing";

import adminRoutes from "./rest/routes/admin";
import metricsRoutes from "./rest/routes/public/metrics";
import searchRoutes from "./rest/routes/public/search";
import matchRoutes from "./rest/routes/public/matches";
import leagueRoutes from "./rest/routes/public/leagues";
import playerRoutes from "./rest/routes/public/players";
import teamRoutes from "./rest/routes/public/teams";
import countryRoutes from "./rest/routes/public/countries";
import clubRoutes from "./rest/routes/public/clubs";
import authRoutes from "./rest/routes/auth";
import { Env } from "./env";
import { ZodError } from "zod";

dotenv.config();

logger.info("API starting...");
const app = new Hono<Env>();
const v1 = new Hono<Env>();

// CORS Middleware - must be before other middleware
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3002",
      "http://localhost:3000",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
    ],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware
app.use("*", async (c, next) => {
  c.set("requestId", requestId());
  await next();
});

app.use("*", honoLogger());

// Error handling
app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      {
        error: "Validation error",
        details: err.flatten(),
      },
      400,
    );
  }

  logger.error({ err, path: c.req.path }, "Unhandled error");
  return c.json(
    { error: "Internal Server Error" },
    500,
  );
});

// Global health check
app.get("/health", createRateLimiter(100, 60), (c) => {
  return c.json({ status: "ok", service: "football-intel-api" });
});

v1.route("/admin", adminRoutes);
v1.route("/metrics", metricsRoutes);
v1.route("/search", searchRoutes);
v1.route("/matches", matchRoutes);
v1.route("/leagues", leagueRoutes);
v1.route("/players", playerRoutes);
v1.route("/teams", teamRoutes);
v1.route("/countries", countryRoutes);
v1.route("/clubs", clubRoutes);
v1.route("/auth", authRoutes);

app.route("/api/v1", v1);

// GraphQL
app.use("/graphql", createRateLimiter(60, 60), async (c) => {
  return yoga.fetch(c.req.raw, c);
});

export default {
  port: 3001,
  fetch: app.fetch,
};
