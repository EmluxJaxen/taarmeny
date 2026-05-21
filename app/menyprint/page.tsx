'use client';

import { useRef, useState } from 'react';

const MENU_DATA = [
  {
    id: "signatur",
    category: "Cocktailmeny",
    items: [
      { name: "Thai basilikum", flavor: "Grønn, aromatisk, floral, leskende", ingredients: "Thai basilikum-infusert gin · bergamotlikør · tequila · sukkerlake · eplesyre · kullsyrevann" },
      { name: "Venezuela's ånd", flavor: "Frisk, urtepreget, krydret, syrlig, tropisk", ingredients: "Lys rom, Green Chartreuse, falernum, kanelsirup, sitron, lime, agurk" },
      { name: "Blomsten fra Jerez", flavor: "Tørr, nøttepreget, fruktig, syrlig, rund", ingredients: "Amontillado sherry · rom · aprikoslikør · sukkerlake · sitron · Angostura bitters" },
      { name: "Te-tid", flavor: "Lys, te-aroma, ren syre, subtil sødme, frisk", ingredients: "Darjeeling-infusert melkevasket vodka, honningsirup, sitron" },
      { name: "Siste blomst", flavor: "Røykfylt, floral, urtepreget, spenstig", ingredients: "Mezcal, St-Germain, Bénédictine D.O.M., sitron" },
      { name: "Eksperimentet", flavor: "Mørk, krydret, aromatisk, med mange lag", ingredients: "Bourbon · fino sherry · Cocchi Americano · Bénédictine · Angostura bitters · orange bitters · Peychaud's bitters" },
      { name: "Bivoks", flavor: "Varm, aromatisk, mild honning, sofistikert", ingredients: "Bivoks-infusert bourbon · cognac · sukkerlake · Angostura bitters · Peychaud's bitters" },
    ],
  },
  {
    id: "manedens",
    category: "Månedens Utvalgte",
    items: [
      { name: "Månedens Margarita", flavor: "Fruktig, spicy, saftig", ingredients: "Jalapeño-infusert tequila, Cointreau, klarifisert jordbær, agave, lime" },
      { name: "Månedens Tiki", flavor: "Tropisk, rund, fyldig, frisk", ingredients: "Smørvasket jamaicansk rom, bananlikør, lønnesirup, lime" },
      { name: "Månedens Negroni", flavor: "Frisk, lett bitter, floral, sitruspreget", ingredients: "Aperol · Lillet Blanc · Hendrick's gin" },
    ],
  },
  {
    id: "olvin",
    category: "Øl & Vin",
    items: [
      { name: "Husets Øl", flavor: "Spør oss om dagens utvalg", ingredients: "Lokalt og internasjonalt håndverksøl på tapp og flaske" },
      { name: "Husets Vin", flavor: "Utvalgte glass og flasker", ingredients: "Naturvin, rødt, hvitt, oransje eller friske bobler fra kjelleren" },
    ],
  },
];

export default function PrintMenuPage() {
  const [scale, setScale] = useState(0.75);
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-neutral-800 text-neutral-100 p-4 md:p-8 flex flex-col items-center select-none font-sans print:p-0 print:bg-white print:text-black">

        {/* ── SCREEN-ONLY CONTROL PANEL ── */}
        <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-700 rounded-xl p-6 mb-8 shadow-xl print:hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-xl font-bold text-[#D9381E] mb-1">
                Utskriftssentral · Taar
              </h1>
              <p className="text-xs text-neutral-400 max-w-xl">
                Denne ruten genererer en fysisk, brettbar meny tilpasset{' '}
                <strong className="text-neutral-200">A4 Liggende</strong>. Innholdet
                synkroniseres automatisk med live-nettsiden.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow transition-all duration-200 active:scale-95 shrink-0"
            >
              Åpne utskriftsdialog
            </button>
          </div>

          {/* Scale slider */}
          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-4">
            <label className="text-xs text-neutral-400 shrink-0 font-semibold uppercase tracking-wider">
              Forhåndsvisning
            </label>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-40 accent-[#D9381E]"
            />
            <span className="text-xs text-neutral-500 w-10">{Math.round(scale * 100)}%</span>
          </div>

          {/* Print setup checklist */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-400">
            {[
              { title: '1. Størrelse / Layout', body: <>Sett papirstørrelse til <span className="text-white">A4</span> og retning til <span className="text-white">Liggende</span>.</> },
              { title: '2. Marger', body: <>Sett marger til <span className="text-white">Ingen</span> eller <span className="text-white">Minimum</span>.</> },
              { title: '3. Bakgrunnsgrafikk', body: <>Huk av for <span className="text-white">"Skriv ut bakgrunnsgrafikk"</span> for å bevare fargetonene.</> },
              { title: '4. Etterbehandling', body: <>Brett arket nøyaktig i to ved den stiplede linjen for en A5-brosjyre.</> },
            ].map(({ title, body }) => (
              <div key={title} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="block font-bold text-neutral-200 mb-1">{title}</span>
                {body}
              </div>
            ))}
          </div>
        </div>

        {/* ── SCALED PREVIEW WRAPPER ── */}
        <div
          className="w-full flex justify-center items-start overflow-auto py-4 print:p-0 print:overflow-visible print:block"
          style={{ minHeight: `calc(${210 * scale}mm + 2rem)` }}
        >
          {/* ── PHYSICAL A4 LANDSCAPE CANVAS ── */}
          <div
            ref={canvasRef}
            id="print-canvas"
            className="relative bg-[#FAF8F5] text-[#2C2A28] shadow-2xl overflow-hidden flex-shrink-0 grid grid-cols-2 print:shadow-none print:m-0 print:border-none"
            style={{
              width: '297mm',
              height: '210mm',
              transformOrigin: 'top center',
              transform: `scale(${scale})`,
              boxSizing: 'border-box',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >

            {/* ═══════════════════════════════════════════════ */}
            {/* COLUMN 1 — Left A5 (back cover / secondary)    */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="w-[148.5mm] h-[210mm] p-[15mm] box-border flex flex-col justify-between bg-[#FAF8F5]">
              <div className="flex flex-col gap-[8mm]">

                {/* Månedens Utvalgte */}
                <section>
                  <h2 className="font-serif text-[13pt] font-bold tracking-tight mb-[4mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">
                    {MENU_DATA[1].category}
                  </h2>
                  <div className="flex flex-col gap-[3.5mm]">
                    {MENU_DATA[1].items.map((item) => (
                      <div key={item.name} className="break-inside-avoid">
                        <h3 className="font-serif text-[10.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                        <p className="font-serif italic text-[9.5pt] text-black/80 leading-snug mt-[0.5mm]">{item.flavor}</p>
                        <p className="font-sans text-[7.5pt] uppercase text-black/50 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>
                          {item.ingredients}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Øl & Vin */}
                <section>
                  <h2 className="font-serif text-[13pt] font-bold tracking-tight mb-[4mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">
                    {MENU_DATA[2].category}
                  </h2>
                  <div className="flex flex-col gap-[3.5mm]">
                    {MENU_DATA[2].items.map((item) => (
                      <div key={item.name} className="break-inside-avoid">
                        <h3 className="font-serif text-[10.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                        <p className="font-serif italic text-[9.5pt] text-black/80 leading-snug mt-[0.5mm]">{item.flavor}</p>
                        <p className="font-sans text-[7.5pt] uppercase text-black/50 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>
                          {item.ingredients}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              <footer className="text-center pt-[5mm] border-t border-black/5">
                <p className="font-sans text-[7pt] uppercase font-semibold text-black/40" style={{ letterSpacing: '0.25em' }}>
                  Posebyhaven · Kristiansand
                </p>
              </footer>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* COLUMN 2 — Right A5 (front cover + cocktails)  */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="w-[148.5mm] h-[210mm] p-[15mm] box-border border-l border-dashed border-black/10 flex flex-col justify-between bg-[#FAF8F5] relative">
              <div className="flex flex-col">

                {/* High-DPI inline SVG brand mark */}
                <div className="w-full flex justify-center mb-[4mm] pt-[2mm]">
                  <svg
                    width="130"
                    height="90"
                    viewBox="0 0 160 110"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Taar Logo"
                  >
                    {/* Outer decorative frame */}
                    <path d="M30 15 L130 18 L125 90 L25 88 Z" stroke="#2C2A28" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M40 25 L120 28 L115 80 L35 78 Z" stroke="#2C2A28" strokeWidth="1" strokeOpacity="0.4" />
                    {/* Accent swirl */}
                    <path d="M65 65 C55 60, 50 45, 65 40 C80 35, 95 50, 85 65 C75 75, 60 70, 55 60" stroke="#D9381E" strokeWidth="5" strokeLinecap="round" />
                    {/* Accent rule */}
                    <path d="M15 82 L145 85" stroke="#D9381E" strokeWidth="4" strokeLinecap="round" />
                    <text x="80" y="102" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9" fontWeight="600" letterSpacing="0.2em" fill="#2C2A28">CAFÉ OG COCKTAILBAR</text>
                  </svg>
                </div>

                {/* Pricing declaration */}
                <div className="text-center mb-[5mm] pb-[4mm] border-b border-black/5">
                  <p className="font-sans uppercase text-[7pt] text-black/60 font-semibold" style={{ letterSpacing: '0.2em' }}>
                    Alle signatur- & månedscocktails
                  </p>
                  <p className="font-serif italic text-[14pt] font-bold text-[#D9381E] mt-[1mm]">kr 189,-</p>
                </div>

                {/* Cocktailmeny */}
                <section>
                  <h2 className="font-serif text-[13pt] font-bold tracking-tight mb-[4mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">
                    {MENU_DATA[0].category}
                  </h2>
                  <div className="grid grid-cols-1 gap-[3mm]">
                    {MENU_DATA[0].items.map((item) => (
                      <div key={item.name} className="break-inside-avoid">
                        <h3 className="font-serif text-[10.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                        <p className="font-serif italic text-[9.5pt] text-black/80 leading-snug mt-[0.5mm]">{item.flavor}</p>
                        <p className="font-sans text-[7.5pt] uppercase text-black/50 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>
                          {item.ingredients}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>

          </div>
        </div>

        {/* ── GLOBAL PRINT OVERRIDES ── */}
        <style>{`
          @media print {
            body, html {
              background: white !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: A4 landscape;
              margin: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #print-canvas {
              transform: none !important;
              width: 297mm !important;
              height: 210mm !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
            }
          }
        `}</style>

    </div>
  );
}
