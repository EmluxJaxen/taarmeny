/**
 * One-time seed script. Run with:
 *   npx tsx db/seed.ts
 *
 * Requires DATABASE_URL to be set in .env.local (loaded by dotenv below).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, menuItems, openingHours } from "./schema";
import { MENU_DATA } from "../lib/menu-data";

const DEFAULT_OPENING_HOURS = [
  { dayName: "Mandag", hours: "Stengt", sortOrder: 0 },
  { dayName: "Tirsdag", hours: "17–23", sortOrder: 1 },
  { dayName: "Onsdag", hours: "17–23", sortOrder: 2 },
  { dayName: "Torsdag", hours: "17–23", sortOrder: 3 },
  { dayName: "Fredag", hours: "17–01", sortOrder: 4 },
  { dayName: "Lørdag", hours: "11–01", sortOrder: 5 },
  { dayName: "Søndag", hours: "14–19", sortOrder: 6 },
];

async function seed() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local");
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  console.log("🌱  Seeding database…");

  // Wipe existing tables cleanly via cascade
  await db.delete(categories);
  console.log("  🧹 Cleared existing menu entries.");

  for (let i = 0; i < MENU_DATA.length; i++) {
    const section = MENU_DATA[i];

    const [inserted] = await db
      .insert(categories)
      .values({
        slug: section.id,
        category: section.category,
        price: section.price ?? null,
        sortOrder: i,
      })
      .returning({ id: categories.id });

    console.log(`  ✓ Category: ${section.category} (id=${inserted.id})`);

    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j];
      await db.insert(menuItems).values({
        categoryId: inserted.id,
        name: item.name,
        price: item.price ?? null,
        flavor: item.flavor ?? null,
        subtitle: item.subtitle ?? null,
        ingredients: item.ingredients ?? null,
        imagePath: item.imagePath ?? null,
        sortOrder: j,
      });
      console.log(`      • ${item.name}`);
    }
  }

  await db.delete(openingHours);
  await db.insert(openingHours).values(DEFAULT_OPENING_HOURS);
  console.log("  ✓ Opening hours seeded.");

  console.log("\n✅  Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
