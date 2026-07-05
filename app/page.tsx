import Image from "next/image";
import MenuCard from "@/components/MenuCard";
import ThemeToggle from "@/components/ThemeToggle";
import AnimateIn from "@/components/AnimateIn";
import { MENU_DATA } from "@/lib/menu-data";

const NAV_ITEMS = [
  { label: "Cocktailmeny", href: "#signatur" },
  { label: "Månedens utvalgte", href: "#manedens" },
  { label: "Alkoholfritt", href: "#alkoholfritt" },
  { label: "Øl", href: "#ol" },
  { label: "Vin", href: "#vin" },
  { label: "Kaffe", href: "#kaffe" },
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
        <div className="flex justify-center items-center mb-6 h-[180px] md:h-[220px]">
          <Image
            src="/images/taarbarlogo.png"
            alt="Taar logo"
            width={288}
            height={220}
            priority
            className="object-contain w-60 md:w-72 h-auto"
          />
        </div>
        <h1 className="sr-only">Taar Café og Cocktailbar - Menyen</h1>
        <h2 className="font-serif text-[clamp(1.25rem,4vw,2rem)] font-medium mb-2">Menyen</h2>
        <p className="font-sans text-sm opacity-50 tracking-wide">
          Cocktailkunst i hjertet av Kristiansand.
        </p>
      </header>

      {/* Global pricing note */}
      <div className="text-center mb-6">
        <p className="font-sans uppercase tracking-[0.2em] text-sm opacity-80">Alle signatur- & månedscocktails</p>
        <p className="font-serif italic text-2xl mt-2">kr 189,-</p>
        <p className="font-serif italic text-sm opacity-60 mt-3">Vi lager også gjerne klassikeren du elsker!</p>
      </div>

      {/* Sticky category nav */}
      <nav
        id="meny"
        className="sticky top-0 z-50 flex items-center bg-[var(--bg-primary)]/80 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 md:pt-[calc(env(safe-area-inset-top)+1.25rem)] md:pb-5 mb-12 -mx-6 px-6 border-y border-black/10 dark:border-white/10 overflow-x-auto no-scrollbar"
        aria-label="Menykategorier"
      >
        <ul className="flex gap-2 items-center font-sans text-xs uppercase tracking-widest font-semibold opacity-70 w-max">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block px-4 py-2 hover:text-[var(--accent-red)] transition-colors"
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
          <div key={section.category} id={section.id} className="scroll-mt-32">
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
                  <MenuCard
                    {...drink}
                    imageSize={drink.imagePath === '/images/rocks.png' ? 55 : 80}
                  />
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
          Vi har begrenset kapasitet. Send oss en melding for å sikre din plass hos oss.
        </p>
        <a
          href="mailto:hei@taarbar.no"
          className="inline-block font-sans text-[0.7rem] uppercase tracking-widest font-semibold px-8 py-3 border border-[var(--accent-red)] text-[var(--accent-red)] rounded-full hover:bg-[var(--accent-red)] hover:text-white transition-all duration-300"
        >
          Send forespørsel
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-10 pt-8 border-t border-black/10 dark:border-white/10 text-center space-y-2">
        <p className="font-sans text-xs uppercase tracking-widest opacity-50">
          Bestill bord{" "}
          <a href="mailto:hei@taarbar.no" className="hover:text-[var(--accent-red)] transition-colors">
            hei@taarbar.no
          </a>
        </p>
        <p className="font-sans text-xs uppercase tracking-widest opacity-50">
          Ønsker du å arrangere noe hos oss?{" "}
          <a href="mailto:hei@taarbar.no" className="hover:text-[var(--accent-red)] transition-colors">
            hei@taarbar.no
          </a>
        </p>
        <p className="font-sans text-xs uppercase tracking-widest opacity-30 pt-2">
          Posebyhaven · Kristiansand
        </p>
      </footer>
    </main>
  );
}
