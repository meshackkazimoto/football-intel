import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  boolean,
  jsonb,
  date,
  unique
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

export const seasons = pgTable("seasons", {
  id: uuid("id").primaryKey().defaultRandom(),
  leagueId: uuid("league_id")
    .references(() => leagues.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g. 2023/24
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const teams = pgTable(
  "teams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clubId: uuid("club_id")
      .references(() => clubs.id)
      .notNull(),
    seasonId: uuid("season_id")
      .references(() => seasons.id)
      .notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => ({
    uniqueClubSeason: unique("unique_club_season").on(
      table.clubId,
      table.seasonId
    )
  })
);
