/**
 * One-time seed script. Run with:
 *   npx tsx db/seed.ts
 *
 * Requires DATABASE_URL to be set in .env.local (loaded by dotenv below).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, menuItems } from "./schema";
import { MENU_DATA } from "../lib/menu-data";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
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

  console.log("\n✅  Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
