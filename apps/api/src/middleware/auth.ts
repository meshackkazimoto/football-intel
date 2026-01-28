import { Lucia } from "lucia";
import { env } from "@football-intel/config";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@football-intel/db/src/client";
import { sessions, users } from "@football-intel/db/src/schema/auth";

declare module "lucia" {
  interface DatabaseUserAttributes {
    email: string;
    role: string;
  }
  
  interface DatabaseSessionAttributes {

  }
}


const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "football_intel_session",
    attributes: {
      secure: env.NODE_ENV === "production"
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      role: attributes.role
    };
  }
});