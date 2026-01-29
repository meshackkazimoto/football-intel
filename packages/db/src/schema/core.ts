import { relations } from "drizzle-orm";
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
  unique,
  index,
} from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leagues = pgTable("leagues", {
  id: uuid("id").primaryKey().defaultRandom(),
  countryId: uuid("country_id")
    .references(() => countries.id)
    .notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  tier: integer("tier").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueClubSeason: unique("unique_club_season").on(
      table.clubId,
      table.seasonId,
    ),
  }),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: uuid("season_id")
    .references(() => seasons.id)
    .notNull(),
  homeTeamId: uuid("home_team_id")
    .references(() => teams.id)
    .notNull(),
  awayTeamId: uuid("away_team_id")
    .references(() => teams.id)
    .notNull(),
  matchDate: timestamp("match_date").notNull(),
  venue: varchar("venue", { length: 200 }),
  status: varchar("status", { length: 20 }).notNull(), // scheduled | finished
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matchEvents = pgTable(
  "match_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .references(() => matches.id)
      .notNull(),
    teamId: uuid("team_id")
      .references(() => teams.id)
      .notNull(),
    playerId: uuid("player_id").references(() => players.id),
    eventType: varchar("event_type", { length: 50 }).notNull(), // goal, yellow_card
    minute: integer("minute").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    matchEventIdx: index("match_event_idx").on(table.matchId),
  }),
);

export const matchLineups = pgTable(
  "match_lineups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .references(() => matches.id)
      .notNull(),
    teamId: uuid("team_id")
      .references(() => teams.id)
      .notNull(),
    playerId: uuid("player_id")
      .references(() => players.id)
      .notNull(),
    position: varchar("position", { length: 50 }).notNull(),
    isStarting: boolean("is_starting").default(true).notNull(),
    jerseyNumber: integer("jersey_number"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    matchTeamPlayerIdx: unique("match_team_player_idx").on(
      table.matchId,
      table.teamId,
      table.playerId,
    ),
  }),
);

export const playerSeasonStats = pgTable(
  "player_season_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .references(() => players.id)
      .notNull(),
    seasonId: uuid("season_id")
      .references(() => seasons.id)
      .notNull(),
    teamId: uuid("team_id")
      .references(() => teams.id)
      .notNull(),

    appearances: integer("appearances").default(0).notNull(),
    goals: integer("goals").default(0).notNull(),
    minutesPlayed: integer("minutes_played").default(0).notNull(),

    lastComputedAt: timestamp("last_computed_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquePlayerSeasonTeam: unique("unique_player_season_team").on(
      table.playerId,
      table.seasonId,
      table.teamId,
    ),
  }),
);

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .references(() => players.id)
    .notNull(),
  fromClubId: uuid("from_club_id").references(() => clubs.id),
  toClubId: uuid("to_club_id")
    .references(() => clubs.id)
    .notNull(),
  seasonId: uuid("season_id")
    .references(() => seasons.id)
    .notNull(),
  transferDate: date("transfer_date").notNull(),
  transferType: varchar("transfer_type", { length: 50 }).notNull(), // permanent | loan | free
  fee: integer("fee"), // in cents/smallest unit
  marketValue: integer("market_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leagueStandings = pgTable(
  "league_standings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    seasonId: uuid("season_id")
      .references(() => seasons.id)
      .notNull(),
    teamId: uuid("team_id")
      .references(() => teams.id)
      .notNull(),

    played: integer("played").default(0).notNull(),
    wins: integer("wins").default(0).notNull(),
    draws: integer("draws").default(0).notNull(),
    losses: integer("losses").default(0).notNull(),
    goalsFor: integer("goals_for").default(0).notNull(),
    goalsAgainst: integer("goals_against").default(0).notNull(),
    goalDifference: integer("goal_difference").default(0).notNull(),
    points: integer("points").default(0).notNull(),

    lastComputedAt: timestamp("last_computed_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueSeasonTeam: unique("unique_season_team").on(
      table.seasonId,
      table.teamId,
    ),
  }),
);

// relations
export const countriesRelations = relations(countries, ({ many }) => ({
  leagues: many(leagues),
  clubs: many(clubs),
  players: many(players), // for nationality
}));

export const leaguesRelations = relations(leagues, ({ one, many }) => ({
  country: one(countries, {
    fields: [leagues.countryId],
    references: [countries.id],
  }),
  seasons: many(seasons),
}));

export const clubsRelations = relations(clubs, ({ one, many }) => ({
  country: one(countries, {
    fields: [clubs.countryId],
    references: [countries.id],
  }),
  teams: many(teams),
}));

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  league: one(leagues, {
    fields: [seasons.leagueId],
    references: [leagues.id],
  }),
  teams: many(teams),
  matches: many(matches),
  standings: many(leagueStandings),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  club: one(clubs, {
    fields: [teams.clubId],
    references: [clubs.id],
  }),
  season: one(seasons, {
    fields: [teams.seasonId],
    references: [seasons.id],
  }),
  homeMatches: many(matches, { relationName: "homeTeam" }),
  awayMatches: many(matches, { relationName: "awayTeam" }),
  contracts: many(playerContracts),
  standings: many(leagueStandings),
  lineups: many(matchLineups),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  nationality: one(countries, {
    fields: [players.nationalityId],
    references: [countries.id],
  }),
  contracts: many(playerContracts),
  stats: many(playerSeasonStats),
  events: many(matchEvents),
  transfers: many(transfers),
}));

export const playerContractsRelations = relations(
  playerContracts,
  ({ one }) => ({
    player: one(players, {
      fields: [playerContracts.playerId],
      references: [players.id],
    }),
    team: one(teams, {
      fields: [playerContracts.teamId],
      references: [teams.id],
    }),
  }),
);

export const matchesRelations = relations(matches, ({ one, many }) => ({
  season: one(seasons, {
    fields: [matches.seasonId],
    references: [seasons.id],
  }),
  homeTeam: one(teams, {
    fields: [matches.homeTeamId],
    references: [teams.id],
    relationName: "homeTeam",
  }),
  awayTeam: one(teams, {
    fields: [matches.awayTeamId],
    references: [teams.id],
    relationName: "awayTeam",
  }),
  events: many(matchEvents),
  lineups: many(matchLineups),
}));

export const matchEventsRelations = relations(matchEvents, ({ one }) => ({
  match: one(matches, {
    fields: [matchEvents.matchId],
    references: [matches.id],
  }),
  team: one(teams, {
    fields: [matchEvents.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [matchEvents.playerId],
    references: [players.id],
  }),
}));

export const matchLineupsRelations = relations(matchLineups, ({ one }) => ({
  match: one(matches, {
    fields: [matchLineups.matchId],
    references: [matches.id],
  }),
  team: one(teams, {
    fields: [matchLineups.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [matchLineups.playerId],
    references: [players.id],
  }),
}));

export const leagueStandingsRelations = relations(
  leagueStandings,
  ({ one }) => ({
    season: one(seasons, {
      fields: [leagueStandings.seasonId],
      references: [seasons.id],
    }),
    team: one(teams, {
      fields: [leagueStandings.teamId],
      references: [teams.id],
    }),
  }),
);

export const playerSeasonStatsRelations = relations(
  playerSeasonStats,
  ({ one }) => ({
    player: one(players, {
      fields: [playerSeasonStats.playerId],
      references: [players.id],
    }),
    season: one(seasons, {
      fields: [playerSeasonStats.seasonId],
      references: [seasons.id],
    }),
    team: one(teams, {
      fields: [playerSeasonStats.teamId],
      references: [teams.id],
    }),
  }),
);

export const transfersRelations = relations(transfers, ({ one }) => ({
  player: one(players, {
    fields: [transfers.playerId],
    references: [players.id],
  }),
  fromClub: one(clubs, {
    fields: [transfers.fromClubId],
    references: [clubs.id],
  }),
  toClub: one(clubs, {
    fields: [transfers.toClubId],
    references: [clubs.id],
  }),
  season: one(seasons, {
    fields: [transfers.seasonId],
    references: [seasons.id],
  }),
}));
