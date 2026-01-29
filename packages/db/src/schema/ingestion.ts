import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  integer,
  boolean,
  text
} from "drizzle-orm/pg-core";

export const ingestionLogs = pgTable("ingestion_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 50 }).notNull(), // MATCH, PLAYER, EVENT
  source: varchar("source", { length: 50 }).notNull(), // ADMIN, SCRAPER
  rawPayload: jsonb("raw_payload").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("pending"), // pending | validated | rejected | verified | processed
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const verificationRecords = pgTable("verification_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  ingestionId: uuid("ingestion_id").notNull(),
  verifierUserId: text("verifier_user_id").notNull(),
  confidenceScore: integer("confidence_score").notNull(), // 1-5
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const ingestionSources = pgTable("ingestion_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  trustLevel: integer("trust_level").notNull(), // 1-5
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});