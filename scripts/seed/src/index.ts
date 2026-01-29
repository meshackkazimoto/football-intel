import { db } from "@football-intel/db/src/client";
import { users } from "@football-intel/db/src/schema/auth";
import { countries, leagues, clubs, teams, seasons, playerContracts, players, matchEvents, matches } from "@football-intel/db/src/schema/core";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding football-intel core data...");

  const [tanzania] = await db
    .insert(countries)
    .values({
      name: "Tanzania",
      code: "TZA",
    })
    .onConflictDoNothing()
    .returning();

  const country =
    tanzania ??
    (await db.query.countries.findFirst({
      where: eq(countries.code, "TZA"),
    }));

  if (!country) {
    throw new Error("Tanzania not found or created");
  }

  console.log("Country:", country.name);

  const [nbcLeague] = await db
    .insert(leagues)
    .values({
      name: "NBC Premier League",
      countryId: country.id,
      tier: 1,
    })
    .onConflictDoNothing()
    .returning();

  const league =
    nbcLeague ??
    (await db.query.leagues.findFirst({
      where: eq(leagues.name, "NBC Premier League"),
    }));

  if (!league) {
    throw new Error("League not found or created");
  }

  console.log("League:", league.name);

  console.log("League: NBC Premier League");
  console.log("Seeding complete");

  const clubData = [
    {
      name: "Simba SC",
      slug: "simba-sc",
      foundedYear: 1936,
      stadiumName: "Benjamin Mkapa Stadium",
      stadiumCapacity: 60000,
      metadata: {
        nickname: "Wekundu wa Msimbazi",
        colors: { primary: "red", secondary: "white" }
      }
    },
    {
      name: "Young Africans SC",
      slug: "young-africans-sc",
      foundedYear: 1935,
      stadiumName: "Benjamin Mkapa Stadium",
      stadiumCapacity: 60000,
      metadata: {
        nickname: "Yanga",
        colors: { primary: "yellow", secondary: "green" }
      }
    },
    {
      name: "Azam FC",
      slug: "azam-fc",
      foundedYear: 2004,
      stadiumName: "Azam Complex",
      stadiumCapacity: 10000,
      metadata: {
        nickname: "Azam",
        colors: { primary: "blue", secondary: "white" }
      }
    }
  ];

  for (const club of clubData) {
    await db
      .insert(clubs)
      .values({
        ...club,
        countryId: country.id
      })
      .onConflictDoNothing();

    console.log(`Club: ${club.name}`);
  }

  const [season] = await db
    .insert(seasons)
    .values({
      name: "2023/24",
      leagueId: league.id,
      startDate: "2023-08-01",
      endDate: "2024-06-30",
      isCurrent: true
    })
    .onConflictDoNothing()
    .returning();

  const currentSeason =
    season ??
    (await db.query.seasons.findFirst({
      where: eq(seasons.name, "2023/24")
    }));

  if (!currentSeason) {
    throw new Error("❌ Season not found");
  }

  console.log("Season:", currentSeason.name);

  const clubList = await db.query.clubs.findMany({
    where: eq(clubs.countryId, country.id)
  });

  for (const club of clubList) {
    await db
      .insert(teams)
      .values({
        clubId: club.id,
        seasonId: currentSeason.id,
        name: club.name
      })
      .onConflictDoNothing();

    console.log(`Team registered: ${club.name} (${currentSeason.name})`);
  }

  // 6. Players
  const playerData = [
    {
      firstName: "Clatous",
      lastName: "Chama",
      fullName: "Clatous Chama",
      slug: "clatous-chama",
      preferredFoot: "right",
      position: "MF",
      teamName: "Young Africans SC",
      jerseyNumber: 17
    },
    {
      firstName: "John",
      lastName: "Bocco",
      fullName: "John Bocco",
      slug: "john-bocco",
      preferredFoot: "right",
      position: "FW",
      teamName: "Young Africans SC",
      jerseyNumber: 9
    },
    {
      firstName: "Sadio",
      lastName: "Kanoute",
      fullName: "Sadio Kanoute",
      slug: "sadio-kanoute",
      preferredFoot: "right",
      position: "MF",
      teamName: "Simba SC",
      jerseyNumber: 8
    }
  ];

  for (const p of playerData) {
    const [inserted] = await db
      .insert(players)
      .values({
        firstName: p.firstName,
        lastName: p.lastName,
        fullName: p.fullName,
        slug: p.slug,
        nationalityId: country.id,
        preferredFoot: p.preferredFoot
      })
      .onConflictDoNothing()
      .returning();

    const player =
      inserted ??
      (await db.query.players.findFirst({
        where: eq(players.slug, p.slug)
      }));

    if (!player) continue;

    const team = await db.query.teams.findFirst({
      where: eq(teams.name, p.teamName)
    });

    if (!team) continue;

    await db
      .insert(playerContracts)
      .values({
        playerId: player.id,
        teamId: team.id,
        position: p.position,
        jerseyNumber: p.jerseyNumber,
        startDate: "2023-07-01",
        isCurrent: true
      })
      .onConflictDoNothing();

    console.log(`Player: ${player.fullName} → ${p.teamName}`);
  }

  // 7. Match (Simba vs Young Africans)
  const simba = await db.query.teams.findFirst({
    where: eq(teams.name, "Simba SC")
  });

  const yanga = await db.query.teams.findFirst({
    where: eq(teams.name, "Young Africans SC")
  });

  if (!simba || !yanga) {
    throw new Error("❌ Teams not found for match");
  }

  const [match] = await db
    .insert(matches)
    .values({
      seasonId: currentSeason.id,
      homeTeamId: simba.id,
      awayTeamId: yanga.id,
      matchDate: new Date("2023-11-05T16:00:00Z"),
      venue: "Benjamin Mkapa Stadium",
      status: "finished",
      homeScore: 1,
      awayScore: 1
    })
    .onConflictDoNothing()
    .returning();

  const game =
    match ??
    (await db.query.matches.findFirst({
      where: eq(matches.venue, "Benjamin Mkapa Stadium")
    }));

  if (!game) throw new Error("❌ Match not created");

  console.log("Match: Simba SC 1–1 Young Africans SC");

  // 8. Match Events
  const chama = await db.query.players.findFirst({
    where: eq(players.slug, "clatous-chama")
  });

  const kanoute = await db.query.players.findFirst({
    where: eq(players.slug, "sadio-kanoute")
  });

  if (!chama || !kanoute) {
    throw new Error("❌ Players not found for events");
  }

  const events = [
    {
      eventType: "goal",
      minute: 34,
      playerId: kanoute.id,
      teamId: simba.id
    },
    {
      eventType: "goal",
      minute: 71,
      playerId: chama.id,
      teamId: yanga.id
    }
  ];

  for (const e of events) {
    await db
      .insert(matchEvents)
      .values({
        matchId: game.id,
        ...e
      })
      .onConflictDoNothing();

    console.log(`Event: ${e.eventType} at ${e.minute}'`);
  }
  
  async function seedAdmin() {
    const email = "admin@football-intel.com";
    const password = "admin_password_123";
    const passwordHash = await Bun.password.hash(password);
  
    try {
      const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      });
  
      if (existing) {
        console.log("Admin user already exists");
        process.exit(0);
      }
  
      await db.insert(users).values({
        email,
        passwordHash,
        role: "SUPER_ADMIN",
      });
  
      console.log(`Admin user created: ${email} / ${password}`);
    } catch (error) {
      console.error("Failed to seed admin", error);
    }
    process.exit(0);
  }
  
  seedAdmin();

}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
