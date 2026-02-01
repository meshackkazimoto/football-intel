CREATE TABLE "moderator_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderator_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"action" varchar(50) NOT NULL,
	"match_id" uuid,
	"season_id" uuid,
	"status" varchar(20) DEFAULT 'accepted',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderator_scores" (
	"moderator_id" uuid PRIMARY KEY NOT NULL,
	"total_actions" integer DEFAULT 0 NOT NULL,
	"accepted_actions" integer DEFAULT 0 NOT NULL,
	"corrected_actions" integer DEFAULT 0 NOT NULL,
	"rejected_actions" integer DEFAULT 0 NOT NULL,
	"trust_score" integer DEFAULT 100 NOT NULL,
	"last_active_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
