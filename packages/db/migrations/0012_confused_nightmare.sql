ALTER TABLE "league_standings"
ADD COLUMN "position" integer;

ALTER TABLE "league_standings"
ADD COLUMN "points_deduction" integer DEFAULT 0;

ALTER TABLE "league_standings"
ADD COLUMN "status" varchar(20);

WITH ranked AS (
  SELECT
    id,
    season_id,
    ROW_NUMBER() OVER (
      PARTITION BY season_id
      ORDER BY
        points DESC,
        goal_difference DESC,
        goals_for DESC
    ) AS computed_position
  FROM league_standings
)
UPDATE league_standings ls
SET position = ranked.computed_position
FROM ranked
WHERE ls.id = ranked.id;

ALTER TABLE "league_standings"
ALTER COLUMN "position" SET NOT NULL;

ALTER TABLE "leagues"
ADD COLUMN "short_name" varchar(20);

ALTER TABLE "leagues"
ADD COLUMN "type" varchar(20) DEFAULT 'league';

ALTER TABLE "leagues"
ADD COLUMN "number_of_teams" integer;

ALTER TABLE "leagues"
ADD COLUMN "logo" text;

CREATE INDEX "league_position_idx"
ON "league_standings" ("season_id", "position");