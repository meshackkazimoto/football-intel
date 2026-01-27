import { db } from "@football-intel/db/src/client";
import { countries, leagues } from "@football-intel/db/src/schema/core";
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
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
