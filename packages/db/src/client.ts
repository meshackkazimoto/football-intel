import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/core";
import * as auth from "./schema/auth";
import * as ingestion from "./schema/ingestion";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema: { ...schema, ...auth, ...ingestion } });
