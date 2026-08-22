import {
  pgTable,
  serial,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    price: text("price"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)]
);

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: text("price"),
  flavor: text("flavor"),
  subtitle: text("subtitle"),
  ingredients: text("ingredients"),
  imagePath: text("image_path"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const openingHours = pgTable("opening_hours", {
  id: serial("id").primaryKey(),
  dayName: text("day_name").notNull(),
  hours: text("hours").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type OpeningHour = typeof openingHours.$inferSelect;

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));
