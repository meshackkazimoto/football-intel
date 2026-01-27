import { db } from "@football-intel/db/src/client";
import { countries, leagues, clubs, teams, seasons } from "@football-intel/db/src/schema/core";
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
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
