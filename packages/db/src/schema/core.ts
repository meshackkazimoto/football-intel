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
import { ingestionLogs, verificationRecords } from "./ingestion";

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
  shortName: varchar("short_name", { length: 20 }), // NBC, EPL
  tier: integer("tier").notNull(),
  type: varchar("type", { length: 20 }).default("league"), // league | cup
  numberOfTeams: integer("number_of_teams"),
  logo: text("logo"), // URL or asset ref
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
  stadiumId: uuid("stadium_id").references(() => stadiums.id),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata").$type<{
    colors?: { primary: string; secondary: string };
    nickname?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stadiums = pgTable("stadiums", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  city: varchar("city", { length: 100 }),
  countryId: uuid("country_id").references(() => countries.id),
  capacity: integer("capacity"),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
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
  status: varchar("status", { length: 20 }).notNull(), // scheduled | live | half_time | finished | postponed
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  currentMinute: integer("current_minute"), // nullable
  period: varchar("period", { length: 5 }), // 1H | HT | 2H | FT
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
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

    uniqueEvent: unique("unique_match_event").on(
      table.matchId,
      table.teamId,
      table.eventType,
      table.minute,
      table.playerId,
    ),
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

export const matchStats = pgTable(
  "match_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .references(() => matches.id)
      .notNull(),
    teamId: uuid("team_id")
      .references(() => teams.id)
      .notNull(),
    possession: integer("possession"), // percentage
    shotsOnTarget: integer("shots_on_target").default(0).notNull(),
    shotsOffTarget: integer("shots_off_target").default(0).notNull(),
    corners: integer("corners").default(0).notNull(),
    fouls: integer("fouls").default(0).notNull(),
    yellowCards: integer("yellow_cards").default(0).notNull(),
    redCards: integer("red_cards").default(0).notNull(),
    saves: integer("saves").default(0).notNull(),
    passAccuracy: integer("pass_accuracy"), // percentage
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueMatchTeam: unique("unique_match_team").on(
      table.matchId,
      table.teamId,
    ),
    matchStatsIdx: index("match_stats_idx").on(table.matchId),
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
    assists: integer("assists").default(0).notNull(),
    minutesPlayed: integer("minutes_played").default(0).notNull(),
    yellowCards: integer("yellow_cards").default(0).notNull(),
    redCards: integer("red_cards").default(0).notNull(),
    shots: integer("shots").default(0).notNull(),
    passAccuracy: integer("pass_accuracy").default(0).notNull(),

    lastComputedAt: timestamp("last_computed_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquePlayerSeasonTeam: unique("unique_player_season_team").on(
      table.playerId,
      table.seasonId,
      table.teamId,
    ),
    playerSeasonIdx: index("player_season_idx").on(
      table.playerId,
      table.seasonId,
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

export const matchPredictions = pgTable(
  "match_predictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .references(() => matches.id)
      .notNull()
      .unique(),
    homeWinProb: integer("home_win_prob").notNull(), // percentage
    drawProb: integer("draw_prob").notNull(),
    awayWinProb: integer("away_win_prob").notNull(),
    predictedHomeScore: integer("predicted_home_score"),
    predictedAwayScore: integer("predicted_away_score"),
    algorithm: varchar("algorithm", { length: 50 }).notNull(), // poisson | elo | ml
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    predictionMatchIdx: index("prediction_match_idx").on(table.matchId),
  }),
);

export const playerMatchRatings = pgTable(
  "player_match_ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .references(() => players.id)
      .notNull(),
    matchId: uuid("match_id")
      .references(() => matches.id)
      .notNull(),
    rating: integer("rating").notNull(), // e.g. 750 for 7.5
    metadata: jsonb("metadata"), // reasoning for rating
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquePlayerMatchRating: unique("unique_player_match_rating").on(
      table.playerId,
      table.matchId,
    ),
    playerRatingIdx: index("player_rating_idx").on(table.playerId),
  }),
);

export const injuries = pgTable("injuries", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .references(() => players.id)
    .notNull(),
  type: varchar("type", { length: 100 }).notNull(), // hamstring, ankle, etc.
  severity: varchar("severity", { length: 50 }), // minor, moderate, severe
  expectedReturn: date("expected_return"),
  isResolved: boolean("is_resolved").default(false).notNull(),
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
    position: integer("position").notNull(),
    played: integer("played").default(0).notNull(),
    wins: integer("wins").default(0).notNull(),
    draws: integer("draws").default(0).notNull(),
    losses: integer("losses").default(0).notNull(),
    goalsFor: integer("goals_for").default(0).notNull(),
    goalsAgainst: integer("goals_against").default(0).notNull(),
    goalDifference: integer("goal_difference").default(0).notNull(),
    points: integer("points").default(0).notNull(),
    pointsDeduction: integer("points_deduction").default(0), // real world
    status: varchar("status", { length: 20 }), // promotion | relegation | playoff | normal
    lastComputedAt: timestamp("last_computed_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueSeasonTeam: unique("unique_season_team").on(
      table.seasonId,
      table.teamId,
    ),
    positionIdx: index("league_position_idx").on(
      table.seasonId,
      table.position,
    ),
  }),
);

export const moderatorActions = pgTable("moderator_actions", {
  id: uuid("id").primaryKey().defaultRandom(),

  moderatorId: uuid("moderator_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // MODERATOR | ADMIN

  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id"),

  action: varchar("action", { length: 50 }).notNull(),  // CREATE_EVENT | UPDATE_STATS | CHANGE_STATUS | CREATE_FIXTURE

  matchId: uuid("match_id"),
  seasonId: uuid("season_id"),

  status: varchar("status", { length: 20 }).default("accepted"),
  // accepted | corrected | rejected

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moderatorScores = pgTable("moderator_scores", {
  moderatorId: uuid("moderator_id").primaryKey(),

  totalActions: integer("total_actions").default(0).notNull(),
  acceptedActions: integer("accepted_actions").default(0).notNull(),
  correctedActions: integer("corrected_actions").default(0).notNull(),
  rejectedActions: integer("rejected_actions").default(0).notNull(),

  trustScore: integer("trust_score").default(100).notNull(),

  lastActiveAt: timestamp("last_active_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  ratings: many(playerMatchRatings),
  injuries: many(injuries),
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
  stats: many(matchStats),
  prediction: one(matchPredictions),
  playerRatings: many(playerMatchRatings),
}));

export const matchPredictionsRelations = relations(
  matchPredictions,
  ({ one }) => ({
    match: one(matches, {
      fields: [matchPredictions.matchId],
      references: [matches.id],
    }),
  }),
);

export const playerMatchRatingsRelations = relations(
  playerMatchRatings,
  ({ one }) => ({
    player: one(players, {
      fields: [playerMatchRatings.playerId],
      references: [players.id],
    }),
    match: one(matches, {
      fields: [playerMatchRatings.matchId],
      references: [matches.id],
    }),
  }),
);

export const injuriesRelations = relations(injuries, ({ one }) => ({
  player: one(players, {
    fields: [injuries.playerId],
    references: [players.id],
  }),
}));

export const matchStatsRelations = relations(matchStats, ({ one }) => ({
  match: one(matches, {
    fields: [matchStats.matchId],
    references: [matches.id],
  }),
  team: one(teams, {
    fields: [matchStats.teamId],
    references: [teams.id],
  }),
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

export const ingestionLogsRelations = relations(
  ingestionLogs,
  ({ many }) => ({
    verifications: many(verificationRecords),
  }),
);

export const verificationRecordsRelations = relations(
  verificationRecords,
  ({ one }) => ({
    ingestion: one(ingestionLogs, {
      fields: [verificationRecords.ingestionId],
      references: [ingestionLogs.id],
    }),
  }),
);

export const stadiumsRelations = relations(stadiums, ({ one }) => ({
  country: one(countries, {
    fields: [stadiums.countryId],
    references: [countries.id],
  }),
}));