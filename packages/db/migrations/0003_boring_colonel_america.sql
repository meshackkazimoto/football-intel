CREATE TABLE "player_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"position" varchar(50) NOT NULL,
	"jersey_number" integer,
	"start_date" date NOT NULL,
	"end_date" date,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"date_of_birth" date,
	"nationality_id" uuid,
	"preferred_foot" varchar(10),
	"height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "player_contracts" ADD CONSTRAINT "player_contracts_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_contracts" ADD CONSTRAINT "player_contracts_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_nationality_id_countries_id_fk" FOREIGN KEY ("nationality_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;