CREATE TABLE "injuries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"type" varchar(100) NOT NULL,
	"severity" varchar(50),
	"expected_return" date,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_lineups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"position" varchar(50) NOT NULL,
	"is_starting" boolean DEFAULT true NOT NULL,
	"jersey_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "match_team_player_idx" UNIQUE("match_id","team_id","player_id")
);
--> statement-breakpoint
CREATE TABLE "match_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"home_win_prob" integer NOT NULL,
	"draw_prob" integer NOT NULL,
	"away_win_prob" integer NOT NULL,
	"predicted_home_score" integer,
	"predicted_away_score" integer,
	"algorithm" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "match_predictions_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
CREATE TABLE "match_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"possession" integer,
	"shots_on_target" integer DEFAULT 0 NOT NULL,
	"shots_off_target" integer DEFAULT 0 NOT NULL,
	"corners" integer DEFAULT 0 NOT NULL,
	"fouls" integer DEFAULT 0 NOT NULL,
	"yellow_cards" integer DEFAULT 0 NOT NULL,
	"red_cards" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"pass_accuracy" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_match_team" UNIQUE("match_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "player_match_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"match_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_player_match_rating" UNIQUE("player_id","match_id")
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"from_club_id" uuid,
	"to_club_id" uuid NOT NULL,
	"season_id" uuid NOT NULL,
	"transfer_date" date NOT NULL,
	"transfer_type" varchar(50) NOT NULL,
	"fee" integer,
	"market_value" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD COLUMN "assists" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD COLUMN "yellow_cards" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD COLUMN "red_cards" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD COLUMN "shots" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD COLUMN "pass_accuracy" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "injuries" ADD CONSTRAINT "injuries_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_lineups" ADD CONSTRAINT "match_lineups_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_predictions" ADD CONSTRAINT "match_predictions_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_stats" ADD CONSTRAINT "match_stats_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_stats" ADD CONSTRAINT "match_stats_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_ratings" ADD CONSTRAINT "player_match_ratings_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_match_ratings" ADD CONSTRAINT "player_match_ratings_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_from_club_id_clubs_id_fk" FOREIGN KEY ("from_club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_to_club_id_clubs_id_fk" FOREIGN KEY ("to_club_id") REFERENCES "public"."clubs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prediction_match_idx" ON "match_predictions" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "match_stats_idx" ON "match_stats" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "player_rating_idx" ON "player_match_ratings" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "player_season_idx" ON "player_season_stats" USING btree ("player_id","season_id");