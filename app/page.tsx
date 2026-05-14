import Image from "next/image";
import MenuCard from "@/components/MenuCard";
import ThemeToggle from "@/components/ThemeToggle";
import AnimateIn from "@/components/AnimateIn";

const MENU_DATA = [
  {
    id: "signatur",
    category: "Signaturcocktails",
    price: "kr 189,-",
    items: [
      { name: "Thai basilikum", flavor: "Grønn, aromatisk, floral, leskende", ingredients: "Thai basilikum · gin · tequila · bergamot · sukkerlake · eplesyre · kullsyrevann", imagePath: "/images/highball.svg" },
      { name: "Venezuela's ånd", flavor: "Frisk, urtepreget, krydret, syrlig, tropisk", ingredients: "Lys rom · Green Chartreuse · falernum · kanelsirup · sitron · lime · agurk", imagePath: "/images/highball.svg" },
      { name: "Blomsten fra Jerez", flavor: "Tørr, nøttepreget, fruktig, syrlig, rund", ingredients: "Amontillado sherry · rom · aprikoslikør · sukkerlake · sitron · Angostura", imagePath: "/images/coupe.svg" },
      { name: "Te-tid", flavor: "Lys, te-aroma, ren syre, subtil sødme, frisk", ingredients: "Darjeeling-infusert melkevasket vodka · honningsirup · sitron", imagePath: "/images/coupe.svg" },
      { name: "Siste blomst", flavor: "Røykfylt, floral, urtepreget, spenstig", ingredients: "Mezcal · St-Germain · Bénédictine D.O.M. · sitron", imagePath: "/images/nick&nora.svg" },
      { name: "Eksperimentet", flavor: "Mørk, krydret, aromatisk, med mange lag", ingredients: "Bourbon · fino sherry · Cocchi Americano · Bénédictine · bitters", imagePath: "/images/nick&nora.svg" },
      { name: "Bivoks", flavor: "Varm, aromatisk, mild honning, sofistikert", ingredients: "Bivoks-infusert bourbon · cognac · sukkerlake · bitters", imagePath: "/images/rocks.svg" },
    ],
  },
  {
    id: "manedens",
    category: "Månedens Utvalgte",
    price: "kr 189,-",
    items: [
      { name: "Månedens Margarita", flavor: "Fruktig, spicy, saftig", ingredients: "Jalapeño-infusert tequila · Cointreau · klarifisert jordbær · agave · lime", imagePath: "/images/rocks.svg" },
      { name: "Månedens Tiki", flavor: "Tropisk, rund, fyldig, frisk", ingredients: "Smørvasket jamaicansk rom · bananlikør · lønnesirup · lime", imagePath: "/images/tiki.svg" },
      { name: "Månedens Negroni", flavor: "Frisk, lett bitter, floral, sitruspreget", ingredients: "Aperol · Lillet Blanc · gin", imagePath: "/images/rocks.svg" },
    ],
  },
  {
    id: "huset",
    category: "Husets Anbefalinger",
    price: null,
    items: [
      { name: "Husets Øl", flavor: "Spør oss om dagens utvalg", ingredients: "Lokalt og internasjonalt", imagePath: "/images/beer.svg" },
      { name: "Husets Vin", flavor: "Utvalgte glass", ingredients: "Rødt, hvitt, oransje eller bobler", imagePath: "/images/wine.svg" },
    ],
  },
];

const NAV_ITEMS = [
  { label: "Signatur", href: "#signatur" },
  { label: "Månedens", href: "#manedens" },
  { label: "Øl & Vin", href: "#huset" },
  { label: "Bestill", href: "#booking" },
];

export default function MenuPage() {
  return (
    <main className="min-h-screen pb-24 max-w-2xl mx-auto px-6 pt-12 selection:bg-[var(--accent-red)] selection:text-white">

      {/* Top bar */}
      <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <header id="konsept" className="mb-12 text-center flex flex-col items-center">
        <div className="relative w-48 h-40 md:w-56 md:h-48 mb-6 mx-auto">
          <Image
            src="/images/logo-light.svg"
            alt="Taar logo"
            fill
            priority
            className="object-contain block dark:hidden"
            sizes="(max-width: 768px) 192px, 224px"
          />
          <Image
            src="/images/logo-dark.svg"
            alt="Taar logo"
            fill
            priority
            className="object-contain hidden dark:block"
            sizes="(max-width: 768px) 192px, 224px"
          />
        </div>
        <h1 className="sr-only">Taar Café og Cocktailbar - Menyen</h1>
        <h2 className="font-serif text-[clamp(1.25rem,4vw,2rem)] font-medium mb-2">Menyen</h2>
        <p className="font-sans text-sm opacity-50 tracking-wide">
          Eksperimentelle smaker i hjertet av Posebyhaven.
        </p>
      </header>

      {/* Global pricing note */}
      <div className="text-center mb-10 pb-10 border-b border-black/10 dark:border-white/10">
        <p className="font-sans uppercase tracking-[0.2em] text-xs opacity-60 mb-2">
          Alle signatur- &amp; månedscocktails
        </p>
        <p className="font-serif italic text-2xl">kr 189,–</p>
      </div>

      {/* Sticky category nav */}
      <nav
        id="meny"
        className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md py-4 mb-10 -mx-6 px-6 border-b border-black/5 dark:border-white/5"
        aria-label="Menykategorier"
      >
        <ul className="flex overflow-x-auto flex-nowrap whitespace-nowrap no-scrollbar gap-1 font-sans text-[0.65rem] uppercase tracking-widest font-semibold opacity-60">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-center px-4 py-3 hover:text-[var(--accent-red)] hover:opacity-100 transition-all duration-200"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu sections */}
      <section className="flex flex-col gap-14">
        {MENU_DATA.map((section) => (
          <div key={section.category} id={section.id}>
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold border-l-4 border-[var(--accent-red)] pl-4 leading-tight">
                {section.category}
              </h2>
              {section.price && (
                <span className="font-serif italic text-sm opacity-50 ml-4 shrink-0">
                  {section.price}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              {section.items.map((drink, index) => (
                <AnimateIn key={drink.name} delay={index * 0.05}>
                  <MenuCard {...drink} />
                </AnimateIn>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Booking CTA */}
      <section
        id="booking"
        className="mt-20 py-14 px-8 rounded-2xl border border-black/10 dark:border-white/10 text-center"
      >
        <p className="font-sans uppercase tracking-[0.2em] text-xs opacity-50 mb-4">
          Reserver plass
        </p>
        <h2 className="font-serif text-3xl font-bold mb-3">Bestill bord</h2>
        <p className="font-sans text-sm opacity-60 mb-8 max-w-xs mx-auto leading-relaxed">
          Vi har begrenset kapasitet. Send oss en melding for å sikre din plass i Posebyhaven.
        </p>
        <a
          href="mailto:hei@taar.no"
          className="inline-block font-sans text-[0.7rem] uppercase tracking-widest font-semibold px-8 py-3 border border-[var(--accent-red)] text-[var(--accent-red)] rounded-full hover:bg-[var(--accent-red)] hover:text-white transition-all duration-300"
        >
          Send forespørsel
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-10 pt-8 border-t border-black/10 dark:border-white/10 text-center">
        <p className="font-sans text-xs uppercase tracking-widest opacity-30">
          Posebyhaven · Kristiansand
        </p>
      </footer>
    </main>
  );
}
