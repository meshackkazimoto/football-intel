import dotenv from "dotenv";

import { Hono } from "hono";
import { yoga } from "./graphql/server";
import { logger } from "@football-intel/logger";
import { createRateLimiter } from "./middleware/rate-limit";

import adminRoutes from "./rest/routes/admin";
import metricsRoutes from "./rest/routes/metrics";
import searchRoutes from "./rest/routes/search";
import matchRoutes from "./rest/routes/matches";
import leagueRoutes from "./rest/routes/leagues";
import playerRoutes from "./rest/routes/players";
import teamRoutes from "./rest/routes/teams";
import countryRoutes from "./rest/routes/countries";
import clubRoutes from "./rest/routes/clubs";

dotenv.config();

logger.info("API starting...");

const app = new Hono();

// Global health check
app.get("/health", createRateLimiter(100, 60), (c) => {
  return c.json({ status: "ok", service: "football-intel-api" });
});

// REST Routes
app.route("/admin", adminRoutes);
app.route("/metrics", metricsRoutes);
app.route("/search", searchRoutes);
app.route("/matches", matchRoutes);
app.route("/leagues", leagueRoutes);
app.route("/players", playerRoutes);
app.route("/teams", teamRoutes);
app.route("/countries", countryRoutes);
app.route("/clubs", clubRoutes);

// GraphQL
app.use("/graphql", createRateLimiter(60, 60), async (c) => {
  return yoga.fetch(c.req.raw, c);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
