export interface MenuItem {
  name: string;
  price?: string;       // e.g. "kr 189,-" or "Glass kr 129,- / Flaske kr 649,-"
  flavor?: string;      // ONLY for cocktail tasting notes
  ingredients?: string; // cocktail ingredient list
  subtitle?: string;    // format descriptor, e.g. "0,5 l på tapp" or "Flaske · 0,33l"
  imagePath?: string;
  dbId?: number;        // menu_items.id — only present when sourced from the DB (admin use)
}

export interface MenuCategory {
  id: string;
  category: string;
  price: string | null;
  items: MenuItem[];
  dbId?: number;         // categories.id — only present when sourced from the DB (admin use)
}

export const MENU_DATA: MenuCategory[] = [
  {
    id: "signatur",
    category: "Cocktailmeny",
    price: "kr 189,-",
    items: [
      { name: "Thai basilikum", flavor: "Grønn, aromatisk, floral, leskende", ingredients: "Thai basilikum-infusert gin · bergamotlikør · tequila · sukkerlake · eplesyre · kullsyrevann", imagePath: "/images/highball.png" },
      { name: "Venezuela's ånd", flavor: "Frisk, urtepreget, krydret, syrlig, tropisk", ingredients: "Lys rom · Green Chartreuse · falernum · kanelsirup · sitron · lime · agurk", imagePath: "/images/highball.png" },
      { name: "Blomsten fra Jerez", flavor: "Tørr, nøttepreget, fruktig, syrlig, rund", ingredients: "Amontillado sherry · rom · aprikoslikør · sukkerlake · sitron · Angostura bitters", imagePath: "/images/coupe.png" },
      { name: "Te-tid", flavor: "Lys, te-aroma, ren syre, subtil sødme, frisk", ingredients: "Darjeeling-infusert melkevasket vodka · honningsirup · sitron", imagePath: "/images/coupe.png" },
      { name: "Siste blomst", flavor: "Røykfylt, floral, urtepreget, spenstig", ingredients: "Mezcal · St-Germain · Bénédictine D.O.M. · sitron", imagePath: "/images/nick&nora.png" },
      { name: "Eksperimentet", flavor: "Mørk, krydret, aromatisk, med mange lag", ingredients: "Bourbon · fino sherry · Cocchi Americano · Bénédictine · Angostura orange & Peychaud's bitters", imagePath: "/images/nick&nora.png" },
      { name: "Bivoks", flavor: "Varm, aromatisk, mild honning", ingredients: "Bivoks-infusert bourbon · cognac · sukkerlake · Angostura bitters · Peychaud's bitters", imagePath: "/images/rocks.png" },
    ],
  },
  {
    id: "manedens",
    category: "Månedens Utvalgte",
    price: "kr 189,-",
    items: [
      { name: "Månedens Margarita", flavor: "Fruktig, spicy, saftig", ingredients: "Jalapeño-infusert tequila · Cointreau · klarifisert jordbær · agave · lime · lava salt", imagePath: "/images/coupe.png" },
      { name: "Månedens Tiki", flavor: "Tropisk, fruktig, syrlig, funky", ingredients: "Rom fra jamaica · rom fra Trinidad og Tobago · pasjonsfrukt · jordbær · mango · ananas · granateple · appelsinblomst · sitron · lime", imagePath: "/images/tiki.png" },
      { name: "Månedens Negroni", flavor: "Frisk, lett bitter, floral, sitruspreget", ingredients: "Aperol · Lillet Blanc · Hendrick's gin", imagePath: "/images/rocks.png" },
    ],
  },
  {
    id: "alkoholfritt",
    category: "Alkoholfritt",
    price: null,
    items: [
      { name: "Alkoholfri cocktail", price: "kr 129,-", subtitle: "Spør oss om dagens smaker og ferske råvarer" },
      { name: "Alkoholfritt øl", price: "kr 79,-", subtitle: "Flaske · 0,33l" },
      { name: "Brus & mineralvann", price: "kr 54,-", subtitle: "Glassflaske · 0,33l, utvalg" },
    ],
  },
  {
    id: "ol",
    category: "Øl",
    price: null,
    items: [
      { name: "Husets øl (CB)", price: "kr 139,-", subtitle: "0,4 l på tapp" },
      { name: "Nøgne Ø Blonde", price: "kr 139,-", subtitle: "0,4 l på tapp" },
    ],
  },
  {
    id: "vin",
    category: "Vin",
    price: null,
    items: [
      { name: "Husets vin", price: "Glass kr 129,- / Flaske kr 625,-", subtitle: "Rødt, hvitt, rosé eller friske bobler" },
    ],
  },
  {
    id: "kaffe",
    category: "Kaffe",
    price: null,
    items: [
      { name: "Filter kaffe", price: "kr 49,-" },
      { name: "Espresso, dobbel", price: "kr 45,-" },
      { name: "Americano", price: "kr 45,-" },
      { name: "Macchiato", price: "kr 49,-" },
      { name: "Cortado", price: "kr 53,-" },
      { name: "Cappuccino", price: "kr 55,-" },
      { name: "Caffe latte", price: "kr 59,-" },
    ],
  },
  {
    id: "snacks",
    category: "Snacks",
    price: null,
    items: [
      { name: "Oliven, Castelvetrano", price: "kr 59,-" },
      { name: "Peanøtter", price: "kr 59,-" },
      { name: "Chips", price: "kr 59,-" },
    ],
  },
];
