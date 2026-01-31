ALTER TABLE "matches" ADD COLUMN "current_minute" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "period" varchar(5);--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "ended_at" timestamp;