import { db } from "@football-intel/db/src/client";
import { countries, leagues, clubs } from "@football-intel/db/src/schema/core";
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

  await db
    .insert(leagues)
    .values({
      name: "NBC Premier League",
      countryId: country.id,
      tier: 1,
    })
    .onConflictDoNothing();

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

}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
