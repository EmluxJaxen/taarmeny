import { MENU_DATA, MenuCategory, MenuItem } from "@/lib/menu-data";

const SITE_URL = "https://taarbar.no";

/**
 * Extracts the first numeric price value from strings like "kr 189,-"
 * or "Glass kr 129,- / Flaske kr 649,-". Returns null for unparseable formats.
 */
function parseFirstPrice(
  priceStr: string
): { price: string; priceCurrency: string } | null {
  const match = priceStr.match(/kr\s+(\d+)/i);
  if (match) {
    return { price: match[1], priceCurrency: "NOK" };
  }
  return null;
}

function buildSchemaMenuItem(item: MenuItem, categoryPrice: string | null) {
  const rawPrice = item.price ?? categoryPrice;
  const offerData = rawPrice ? parseFirstPrice(rawPrice) : null;

  const descParts: string[] = [];
  if (item.flavor) descParts.push(item.flavor);
  if (item.ingredients) descParts.push(item.ingredients);
  if (item.subtitle) descParts.push(item.subtitle);

  const schemaItem: Record<string, unknown> = {
    "@type": "MenuItem",
    name: item.name,
  };

  if (descParts.length > 0) {
    schemaItem.description = descParts.join(". ");
  }

  if (offerData) {
    schemaItem.offers = {
      "@type": "Offer",
      price: offerData.price,
      priceCurrency: offerData.priceCurrency,
    };
  }

  return schemaItem;
}

function buildSchemaMenuSection(category: MenuCategory) {
  return {
    "@type": "MenuSection",
    name: category.category,
    hasMenuItem: category.items.map((item) =>
      buildSchemaMenuItem(item, category.price)
    ),
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: "Taar",
    description:
      "Cocktailkunst i hjertet av Kristiansand. Eksperimentelle smaker i Posebyhaven.",
    url: SITE_URL,
    email: "hei@taarbar.no",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Posebyhaven",
      addressLocality: "Kristiansand",
      addressRegion: "Agder",
      addressCountry: "NO",
    },
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: MENU_DATA.map(buildSchemaMenuSection),
    },
  };
}
