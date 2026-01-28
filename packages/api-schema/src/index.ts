import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

import { resolvers } from "./resolvers";

export const typeDefs = readFileSync(
  join(__dirname, "schema.graphql"),
  "utf-8",
);

export { resolvers };
