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

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  dateOfBirth: date("date_of_birth"),
  nationalityId: uuid("nationality_id").references(() => countries.id),
  preferredFoot: varchar("preferred_foot", { length: 10 }), // left | right | both
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const playerContracts = pgTable("player_contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .references(() => players.id)
    .notNull(),
  teamId: uuid("team_id")
    .references(() => teams.id)
    .notNull(),
  position: varchar("position", { length: 50 }).notNull(), // GK, DF, MF, FW
  jerseyNumber: integer("jersey_number"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

