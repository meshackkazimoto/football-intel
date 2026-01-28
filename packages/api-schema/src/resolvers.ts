import { db } from "@football-intel/db/src/client";
import {
  clubs,
  players,
  leagueStandings,
  teams
} from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";

export const resolvers = {
  Query: {
    clubs: async () => {
      return db.query.clubs.findMany();
    },

    players: async () => {
      return db.query.players.findMany();
    },

    standings: async (_: unknown, args: { seasonId: string }) => {
      const rows = await db.query.leagueStandings.findMany({
        where: eq(leagueStandings.seasonId, args.seasonId),
        with: {
          team: true
        },
        orderBy: (s, { desc }) => [
          desc(s.points),
          desc(s.goalDifference)
        ]
      });

      return rows.map((r) => ({
        teamName: r.team.name,
        played: r.played,
        wins: r.wins,
        draws: r.draws,
        losses: r.losses,
        goalDifference: r.goalDifference,
        points: r.points
      }));
    }
  }
};
