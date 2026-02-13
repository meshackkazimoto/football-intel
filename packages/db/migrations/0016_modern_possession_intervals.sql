CREATE TABLE "match_possessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "match_id" uuid NOT NULL,
  "team_id" uuid NOT NULL,
  "start_second" integer NOT NULL,
  "end_second" integer,
  "source" varchar(20) DEFAULT 'manual' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "match_possessions"
  ADD CONSTRAINT "match_possessions_match_id_matches_id_fk"
  FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "match_possessions"
  ADD CONSTRAINT "match_possessions_team_id_teams_id_fk"
  FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id")
  ON DELETE no action ON UPDATE no action;

CREATE INDEX "match_possession_idx" ON "match_possessions" USING btree ("match_id");
CREATE INDEX "open_possession_idx" ON "match_possessions" USING btree ("match_id", "end_second");
