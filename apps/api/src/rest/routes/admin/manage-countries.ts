import { Hono } from "hono";
import { type User, type Session } from "lucia";
import { db } from "@football-intel/db/src/client";
import { countries } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";
import { createCountrySchema, updateCountrySchema } from "@football-intel/validation";
import { auditLog } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";

const app = new Hono<{
    Variables: {
        user: User | null;
        session: Session | null;
    };
}>();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN"]));

app.get("/", async (c) => {
    const result = await db.query.countries.findMany({
        orderBy: (c, { asc }) => [asc(c.name)],
    });

    return c.json(result);
});

app.post("/", async (c) => {
    const body = createCountrySchema.parse(await c.req.json());

    if (!body.name || !body.code) {
        return c.json(
            { error: "name and code are required" },
            400,
        );
    }

    const [created] = await db
        .insert(countries)
        .values({
            name: body.name.trim(),
            code: body.code.toUpperCase().trim(),
        })
        .onConflictDoNothing()
        .returning();

    if (!created) {
        return c.json(
            { error: "Country already exists" },
            409,
        );
    }

    auditLog({
        action: "CREATE",
        entity: "COUNTRY",
        entityId: created.id,
        userId: c.get("user")!.id,
    });

    return c.json(created, 201);
});

app.patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = updateCountrySchema.parse(await c.req.json());

    const [updated] = await db
        .update(countries)
        .set({
            ...(body.name && { name: body.name.trim() }),
            ...(body.code && { code: body.code.toUpperCase().trim() }),
        })
        .where(eq(countries.id, id))
        .returning();

    if (!updated) {
        return c.json({ error: "Country not found" }, 404);
    }

    auditLog({
        action: "UPDATE",
        entity: "COUNTRY",
        entityId: id,
        userId: c.get("user")!.id,
        metadata: body,
    });

    return c.json(updated);
});

app.delete("/:id", async (c) => {
    const id = c.req.param("id");

    const [deleted] = await db
        .delete(countries)
        .where(eq(countries.id, id))
        .returning();

    if (!deleted) {
        return c.json({ error: "Country not found" }, 404);
    }

    auditLog({
        action: "DELETE",
        entity: "COUNTRY",
        entityId: id,
        userId: c.get("user")!.id,
    });

    return c.json({ ok: true });
});

export default app;