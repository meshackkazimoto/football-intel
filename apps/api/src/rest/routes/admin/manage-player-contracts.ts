import { Hono } from "hono";
import { Session, User } from "lucia";
import { db } from "@football-intel/db/src/client";
import {
  playerContracts,
  players,
  teams,
} from "@football-intel/db/src/schema/core";
import { and, eq, gte, lte, or, isNull, ne } from "drizzle-orm";
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
  const startDate = body.startDate;
  const endDate = body.endDate;

  if (endDate && endDate < startDate) {
    return c.json(
      { error: "Contract endDate cannot be earlier than startDate" },
      400,
    );
  }

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

  const currentContracts = await db.query.playerContracts.findMany({
    where: and(
      eq(playerContracts.playerId, body.playerId),
      eq(playerContracts.isCurrent, true),
    ),
  });

  if (currentContracts.length > 1) {
    return c.json(
      {
        error:
          "Player has multiple active contracts. Resolve data before assigning.",
      },
      409,
    );
  }

  const [currentContract] = currentContracts;
  if (currentContract && startDate <= currentContract.startDate) {
    return c.json(
      {
        error: "New contract startDate must be after current contract startDate.",
      },
      409,
    );
  }

  const overlap = await db.query.playerContracts.findFirst({
    where: and(
      eq(playerContracts.playerId, body.playerId),
      currentContract ? ne(playerContracts.id, currentContract.id) : undefined,
      lte(playerContracts.startDate, endDate ?? "9999-12-31"),
      or(
        isNull(playerContracts.endDate),
        gte(playerContracts.endDate, startDate),
      ),
    ),
  });

  if (overlap) {
    return c.json(
      {
        error:
          "Contract overlaps with another team assignment for this player.",
      },
      409,
    );
  }

  const [contract] = await db.transaction(async (tx) => {
    if (currentContract) {
      await tx
        .update(playerContracts)
        .set({
          isCurrent: false,
          endDate: startDate,
        })
        .where(eq(playerContracts.id, currentContract.id));
    }

    return await tx
      .insert(playerContracts)
      .values({
        playerId: body.playerId,
        teamId: body.teamId,
        position: body.position,
        jerseyNumber: body.jerseyNumber,
        startDate,
        endDate: endDate ?? null,
        isCurrent: true,
      })
      .returning();
  });

  if (!contract) {
    return c.json({ error: "Could not create contract" }, 500);
  }

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

  const existing = await db.query.playerContracts.findFirst({
    where: eq(playerContracts.id, id),
  });

  if (!existing) {
    return c.json({ error: "Contract not found" }, 404);
  }

  if (body.endDate && body.endDate < existing.startDate) {
    return c.json(
      { error: "Contract endDate cannot be earlier than startDate" },
      400,
    );
  }

  const updateData = {
    position: body.position,
    jerseyNumber: body.jerseyNumber,
    endDate: body.endDate,
    isCurrent: body.isCurrent,
  };

  const [updated] = await db.transaction(async (tx) => {
    if (body.isCurrent === true) {
      await tx
        .update(playerContracts)
        .set({ isCurrent: false })
        .where(
          and(
            eq(playerContracts.playerId, existing.playerId),
            eq(playerContracts.isCurrent, true),
            ne(playerContracts.id, id),
          ),
        );
    }

    return await tx
      .update(playerContracts)
      .set(updateData)
      .where(eq(playerContracts.id, id))
      .returning();
  });

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

  const existing = await db.query.playerContracts.findFirst({
    where: eq(playerContracts.id, id),
  });

  if (!existing) {
    return c.json({ error: "Contract not found" }, 404);
  }

  if (existing.isCurrent) {
    const today = new Date().toISOString().slice(0, 10);

    const [terminated] = await db
      .update(playerContracts)
      .set({
        isCurrent: false,
        endDate: today,
      })
      .where(eq(playerContracts.id, id))
      .returning();

    auditLog({
      action: "TERMINATE",
      entity: "PLAYER_CONTRACT",
      entityId: id,
      userId: c.get("user").id,
      metadata: { endDate: today },
    });

    return c.json({
      ok: true,
      mode: "terminated",
      contract: terminated,
    });
  }

  const [deleted] = await db
    .delete(playerContracts)
    .where(eq(playerContracts.id, id))
    .returning();

  auditLog({
    action: "DELETE",
    entity: "PLAYER_CONTRACT",
    entityId: id,
    userId: c.get("user").id,
  });

  return c.json({ ok: true });
});

export default app;
