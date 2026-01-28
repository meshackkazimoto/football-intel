import { withCache } from "@football-intel/cache";
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
      return await withCache("clubs", 60 * 60, async () => {
        return db.query.clubs.findMany();
      });
    },

    players: async () => {
      return db.query.players.findMany();
    },

    standings: async (_: unknown, args: { seasonId: string }, ctx: any) => {
      if (!ctx.user) {
        throw new Error("UNAUTHENTICATED");
      }

      const rows = await db.query.leagueStandings.findMany({
        where: eq(leagueStandings.seasonId, args.seasonId),
        orderBy: (s, { desc }) => [
          desc(s.points),
          desc(s.goalDifference)
        ]
      });

      return Promise.all(
        rows.map(async (r) => {
          const team = await ctx.loaders.teamById.load(r.teamId);
          const club = team
            ? await ctx.loaders.clubById.load(team.clubId)
            : null;

          return {
            teamName: club?.name ?? "Unknown",
            played: r.played,
            wins: r.wins,
            draws: r.draws,
            losses: r.losses,
            goalDifference: r.goalDifference,
            points: r.points
          };
        })
      );
    }
  }
};
