import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const leagues = pgTable("leagues", {
  id: uuid("id").primaryKey().defaultRandom(),
  countryId: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  tier: integer("tier").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  countryId: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  foundedYear: integer("founded_year"),
  stadiumName: varchar("stadium_name", { length: 200 }),
  stadiumCapacity: integer("stadium_capacity"),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<{
    colors?: { primary: string; secondary: string };
    nickname?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});