import { Context } from "hono";
import { lucia } from "../middleware/auth";
import { createLoaders } from "@football-intel/domain";

export async function createContext(c: Context) {
  const cookie = c.req.header("cookie") ?? "";
  const sessionId = lucia.readSessionCookie(cookie);
  
  const loaders = createLoaders();

  if (!sessionId) {
    return { user: null, loaders };
  }

  const { user } = await lucia.validateSession(sessionId);

  return { user, loaders };
}
