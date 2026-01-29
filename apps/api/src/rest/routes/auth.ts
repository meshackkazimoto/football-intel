import { Hono } from "hono";
import { db } from "@football-intel/db/src/client";
import { users } from "@football-intel/db/src/schema/auth";
import { eq } from "drizzle-orm";
import { authMiddleware, lucia } from "../../middleware/auth";
import { logger } from "@football-intel/logger";
import { type User, type Session } from "lucia";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.use("*", authMiddleware);

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Missing email or password" }, 400);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.passwordHash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const validPassword = await Bun.password.verify(password, user.passwordHash);

  if (!validPassword) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const session = await lucia.createSession(user.id, {});
  c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
    append: true,
  });

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

app.post("/logout", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await lucia.invalidateSession(session.id);
  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
    append: true,
  });
  return c.json({ ok: true });
});

app.get("/me", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ user: null });
  }
  return c.json({ user });
});

export default app;
