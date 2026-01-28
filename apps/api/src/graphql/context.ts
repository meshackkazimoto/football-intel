import { Context } from "hono";
import { lucia } from "../middleware/auth";

export async function createContext(c: Context) {
  const cookie = c.req.header("cookie") ?? "";

  const sessionId = lucia.readSessionCookie(cookie);

  if (!sessionId) {
    return { user: null };
  }

  const { user } = await lucia.validateSession(sessionId);

  return { user };
}
