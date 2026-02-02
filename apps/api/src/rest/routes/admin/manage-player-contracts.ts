import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import {
  playerContracts,
  players,
  teams,
} from "@football-intel/db/src/schema/core";
import { and, eq } from "drizzle-orm";
import { auditLog } from "@football-intel/logger";
import { requireRole } from "src/middleware/require-role";
import {
  createPlayerContractSchema,
  updatePlayerContractSchema,
} from "@football-intel/validation";

const app = new Hono<{
  Variables: {
    user: User;
    session: Session;
  };
}>();

app.use("*", requireRole(["SUPER_ADMIN", "ADMIN"]));

app.post("/", async (c) => {
  const body = createPlayerContractSchema.parse(await c.req.json());

  // Validate player
  const player = await db.query.players.findFirst({
    where: eq(players.id, body.playerId),
  });
  if (!player) {
    return c.json({ error: "Player not found" }, 404);
  }

  // Validate team
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, body.teamId),
  });
  if (!team) {
    return c.json({ error: "Team not found" }, 404);
  }

  // Close existing active contract
  await db
    .update(playerContracts)
    .set({
      isCurrent: false,
      endDate: body.startDate,
    })
    .where(
      and(
        eq(playerContracts.playerId, body.playerId),
        eq(playerContracts.isCurrent, true),
      ),
    );

  // Create new contract
  const [contract] = await db
    .insert(playerContracts)
    .values({
      playerId: body.playerId,
      teamId: body.teamId,
      position: body.position,
      jerseyNumber: body.jerseyNumber,
      startDate: body.startDate,
      endDate: body.endDate ?? null,
      isCurrent: true,
    })
    .returning();

  auditLog({
    action: "CREATE",
    entity: "PLAYER_CONTRACT",
    entityId: contract.id,
    userId: c.get("user").id,
    metadata: {
      playerId: body.playerId,
      teamId: body.teamId,
      position: body.position,
      jerseyNumber: body.jerseyNumber,
    },
  });

  return c.json(contract, 201);
});

app.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = updatePlayerContractSchema.parse(await c.req.json());

  const updateData = {
    position: body.position,
    jerseyNumber: body.jerseyNumber,
    endDate: body.endDate,
    isCurrent: body.isCurrent,
  };

  const [updated] = await db
    .update(playerContracts)
    .set(updateData)
    .where(eq(playerContracts.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Contract not found" }, 404);
  }

  auditLog({
    action: "UPDATE",
    entity: "PLAYER_CONTRACT",
    entityId: id,
    userId: c.get("user").id,
    metadata: body,
  });

  return c.json(updated);
});

app.get("/", async (c) => {
  const playerId = c.req.query("playerId");
  const teamId = c.req.query("teamId");

  const contracts = await db.query.playerContracts.findMany({
    where:
      playerId && teamId
        ? and(
            eq(playerContracts.playerId, playerId),
            eq(playerContracts.teamId, teamId),
          )
        : playerId
        ? eq(playerContracts.playerId, playerId)
        : teamId
        ? eq(playerContracts.teamId, teamId)
        : undefined,
    with: {
      player: true,
      team: {
        with: {
          club: true,
          season: true,
        },
      },
    },
    orderBy: (pc, { desc }) => [desc(pc.startDate)],
  });

  return c.json(contracts);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(playerContracts)
    .where(eq(playerContracts.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Contract not found" }, 404);
  }

  auditLog({
    action: "DELETE",
    entity: "PLAYER_CONTRACT",
    entityId: id,
    userId: c.get("user").id,
  });

  return c.json({ ok: true });
});

export default app;