'use client';

import { useRef, useState } from 'react';
import type { MenuCategory } from '@/lib/menu-data';

export default function PrintMenuClient({ menuData }: { menuData: MenuCategory[] }) {
  const [scale, setScale] = useState(0.75);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dynamic layout mapping
  const cocktails = menuData.find((c) => c.id === 'signatur') || { category: 'Cocktailmeny', items: [] };
  const monthly = menuData.find((c) => c.id === 'manedens') || { category: 'Månedens Utvalgte', items: [] };
  const nonAlcoholic = menuData.find((c) => c.id === 'alkoholfritt') || { category: 'Alkoholfritt', items: [] };
  const coffee = menuData.find((c) => c.id === 'kaffe') || { category: 'Kaffe', items: [] };
  const snacks = menuData.find((c) => c.id === 'snacks') || { category: 'Snacks', items: [] };

  // Combine Øl and Vin
  const olItems = menuData.find((c) => c.id === 'ol')?.items || [];
  const vinItems = menuData.find((c) => c.id === 'vin')?.items || [];
  const beerAndWine = { category: 'Øl & Vin', items: [...olItems, ...vinItems] };

  return (
    <div className="min-h-screen bg-neutral-800 text-neutral-100 p-4 md:p-8 flex flex-col items-center select-none font-sans print:p-0 print:bg-white print:text-black">

      {/* ── SCREEN-ONLY CONTROL PANEL ── */}
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-700 rounded-xl p-6 mb-8 shadow-xl print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl font-bold text-[#D9381E] mb-1">Utskriftssentral · Taar</h1>
            <p className="text-xs text-neutral-400 max-w-xl">Denne ruten genererer en fysisk, brettbar meny tilpasset <strong className="text-neutral-200">A4 Liggende</strong>.</p>
          </div>
          <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow transition-all active:scale-95 shrink-0">
            Åpne utskriftsdialog
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-4">
          <label className="text-xs text-neutral-400 shrink-0 font-semibold uppercase tracking-wider">Forhåndsvisning</label>
          <input type="range" min={0.3} max={1} step={0.05} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-40 accent-[#D9381E]" />
          <span className="text-xs text-neutral-500 w-10">{Math.round(scale * 100)}%</span>
        </div>

        {/* Print setup checklist */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-400">
          {[
            { title: '1. Størrelse / Layout', body: <>Sett papirstørrelse til <span className="text-white">A4</span> og retning til <span className="text-white">Liggende</span>.</> },
            { title: '2. Marger', body: <>Sett marger til <span className="text-white">Ingen</span> eller <span className="text-white">Minimum</span>.</> },
            { title: '3. Bakgrunnsgrafikk', body: <>Huk av for <span className="text-white">&quot;Skriv ut bakgrunnsgrafikk&quot;</span> for å bevare fargetonene.</> },
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
      <div className="w-full flex justify-center items-start overflow-auto py-4 print:p-0 print:overflow-visible print:block" style={{ minHeight: `calc(${210 * scale}mm + 2rem)` }}>
        <div ref={canvasRef} id="print-canvas" className="relative bg-[#FAF8F5] text-[#2C2A28] shadow-2xl overflow-hidden flex-shrink-0 grid grid-cols-2 print:shadow-none print:m-0 print:border-none" style={{ width: '297mm', height: '210mm', transformOrigin: 'top center', transform: `scale(${scale})`, boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>

          {/* ═══════════════════════════════════════════════ */}
          {/* COLUMN 1 — Left A5 (Secondary Menu Items)      */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="w-[148.5mm] h-[210mm] p-[15mm] box-border flex flex-col justify-between bg-[#FAF8F5]">
            <div className="flex flex-col gap-[6mm]">

              {/* Øl & Vin */}
              <section>
                <h2 className="font-serif text-[12pt] font-bold tracking-tight mb-[3mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">{beerAndWine.category}</h2>
                <div className="flex flex-col gap-[2.5mm]">
                  {beerAndWine.items.map((item) => (
                    <div key={item.name} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-serif text-[10pt] font-bold tracking-tight text-black">{item.name}</h3>
                        {item.price && <span className="font-serif text-[9pt] font-bold text-[#D9381E]">{item.price}</span>}
                      </div>
                      <p className="font-sans text-[7pt] uppercase text-black/60 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>{item.subtitle || item.ingredients}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Alkoholfritt */}
              <section>
                <h2 className="font-serif text-[12pt] font-bold tracking-tight mb-[3mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">{nonAlcoholic.category}</h2>
                <div className="flex flex-col gap-[2.5mm]">
                  {nonAlcoholic.items.map((item) => (
                    <div key={item.name} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="font-serif text-[10pt] font-bold tracking-tight text-black">{item.name}</h3>
                        {item.price && <span className="font-serif text-[9pt] font-bold text-[#D9381E]">{item.price}</span>}
                      </div>
                      <p className="font-sans text-[7pt] uppercase text-black/60 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>{item.subtitle}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Compact Grid: Kaffe & Snacks */}
              <div className="grid grid-cols-2 gap-[4mm]">
                <section>
                  <h2 className="font-serif text-[11pt] font-bold tracking-tight mb-[2mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">{coffee.category}</h2>
                  <div className="flex flex-col gap-[1.5mm]">
                    {coffee.items.map((item) => (
                      <div key={item.name} className="flex justify-between items-baseline gap-2 break-inside-avoid">
                        <h3 className="font-serif text-[9pt] tracking-tight text-black/90">{item.name}</h3>
                        {item.price && <span className="font-sans text-[7pt] font-bold text-[#D9381E]">{item.price}</span>}
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h2 className="font-serif text-[11pt] font-bold tracking-tight mb-[2mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">{snacks.category}</h2>
                  <div className="flex flex-col gap-[1.5mm]">
                    {snacks.items.map((item) => (
                      <div key={item.name} className="flex justify-between items-baseline gap-2 break-inside-avoid">
                        <h3 className="font-serif text-[9pt] tracking-tight text-black/90">{item.name}</h3>
                        {item.price && <span className="font-sans text-[7pt] font-bold text-[#D9381E]">{item.price}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

            </div>
            <footer className="text-center pt-[5mm] border-t border-black/5">
              <p className="font-sans text-[7pt] uppercase font-semibold text-black/40" style={{ letterSpacing: '0.25em' }}>Posebyhaven · Kristiansand</p>
            </footer>
          </div>

          {/* ═══════════════════════════════════════════════ */}
          {/* COLUMN 2 — Right A5 (Main Cocktails)           */}
          {/* ═══════════════════════════════════════════════ */}
          <div className="w-[148.5mm] h-[210mm] p-[15mm] box-border border-l border-dashed border-black/10 flex flex-col justify-between bg-[#FAF8F5] relative">
            <div className="flex flex-col gap-[4mm]">

              {/* Brand mark & Pricing */}
              <div>
                <div className="w-full flex justify-center mb-[2mm]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/taarbarlogo.png" alt="Taar Logo" width={110} height={70} style={{ objectFit: "contain" }} />
                </div>
                <div className="text-center pb-[3mm] border-b border-black/5">
                  <p className="font-sans uppercase text-[6.5pt] text-black/60 font-semibold" style={{ letterSpacing: '0.2em' }}>Alle signatur- & månedscocktails</p>
                  <p className="font-serif italic text-[12pt] font-bold text-[#D9381E] mt-[1mm]">kr 189,-</p>
                </div>
              </div>

              {/* Cocktailmeny */}
              <section>
                <h2 className="font-serif text-[12pt] font-bold tracking-tight mb-[3mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">{cocktails.category}</h2>
                <div className="grid grid-cols-1 gap-[2.5mm]">
                  {cocktails.items.map((item) => (
                    <div key={item.name} className="break-inside-avoid">
                      <h3 className="font-serif text-[9.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                      {item.flavor && <p className="font-serif italic text-[8.5pt] text-black/80 leading-snug">{item.flavor}</p>}
                      <p className="font-sans text-[7pt] uppercase text-black/50 font-medium leading-relaxed" style={{ letterSpacing: '0.02em' }}>{item.ingredients}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Månedens Utvalgte */}
              <section>
                <h2 className="font-serif text-[12pt] font-bold tracking-tight mb-[3mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">{monthly.category}</h2>
                <div className="grid grid-cols-1 gap-[2.5mm]">
                  {monthly.items.map((item) => (
                    <div key={item.name} className="break-inside-avoid">
                      <h3 className="font-serif text-[9.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                      {item.flavor && <p className="font-serif italic text-[8.5pt] text-black/80 leading-snug">{item.flavor}</p>}
                      <p className="font-sans text-[7pt] uppercase text-black/50 font-medium leading-relaxed" style={{ letterSpacing: '0.02em' }}>{item.ingredients}</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>

        </div>
      </div>

      <style>{`@media print { body, html { background: white !important; color: #000000 !important; margin: 0 !important; padding: 0 !important; } @page { size: A4 landscape; margin: 0; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } #print-canvas { transform: none !important; width: 297mm !important; height: 210mm !important; position: fixed !important; top: 0 !important; left: 0 !important; } }`}</style>
    </div>
  );
}
