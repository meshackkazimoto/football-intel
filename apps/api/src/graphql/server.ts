import { createYoga, createSchema } from "graphql-yoga";
import { typeDefs, resolvers } from "@football-intel/api-schema";

export const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
  graphqlEndpoint: "/graphql",
  landingPage: true,
});
