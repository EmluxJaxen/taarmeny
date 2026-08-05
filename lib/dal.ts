import { db } from "@/db/client";
import { categories, menuItems } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import type { MenuCategory, MenuItem } from "@/lib/menu-data";

/**
 * Fetches all menu categories and their items from the database,
 * returning them in the exact same shape as the static MENU_DATA array
 * so existing page components require zero changes.
 */
export async function getMenuData(): Promise<MenuCategory[]> {
  const rows = await db
    .select({
      categoryId: categories.id,
      categorySlug: categories.slug,
      categoryName: categories.category,
      categoryPrice: categories.price,
      categorySortOrder: categories.sortOrder,
      itemId: menuItems.id,
      itemName: menuItems.name,
      itemPrice: menuItems.price,
      itemFlavor: menuItems.flavor,
      itemSubtitle: menuItems.subtitle,
      itemIngredients: menuItems.ingredients,
      itemImagePath: menuItems.imagePath,
      itemSortOrder: menuItems.sortOrder,
    })
    .from(categories)
    .leftJoin(menuItems, eq(menuItems.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder), asc(menuItems.sortOrder));

  // Group flat rows into the MenuCategory[] shape
  const categoryMap = new Map<number, MenuCategory>();

  for (const row of rows) {
    if (!categoryMap.has(row.categoryId)) {
      categoryMap.set(row.categoryId, {
        id: row.categorySlug,
        dbId: row.categoryId,
        category: row.categoryName,
        price: row.categoryPrice,
        items: [],
      });
    }

    if (row.itemId !== null) {
      const item: MenuItem = { name: row.itemName!, dbId: row.itemId! };
      if (row.itemPrice) item.price = row.itemPrice;
      if (row.itemFlavor) item.flavor = row.itemFlavor;
      if (row.itemSubtitle) item.subtitle = row.itemSubtitle;
      if (row.itemIngredients) item.ingredients = row.itemIngredients;
      if (row.itemImagePath) item.imagePath = row.itemImagePath;

      categoryMap.get(row.categoryId)!.items.push(item);
    }
  }

  return Array.from(categoryMap.values());
}
