'use client';

import { useEffect, useState } from 'react';
import type { MenuCategory, MenuItem } from '@/lib/menu-data';
import type { OpeningHour } from '@/db/schema';
import { addMenuItem, updateMenuItem, deleteMenuItem, saveCategoryOrder, updateOpeningHours } from './actions';

type EditTarget = MenuItem & { dbId: number };
type AddTarget = { categoryId: number; categoryName: string };

const IMAGE_OPTIONS = [
  { value: '', label: 'INGEN' },
  { value: '/images/rocks.png', label: 'ROCKS · LAVT GLASS' },
  { value: '/images/highball.png', label: 'HIGHBALL · HØYT GLASS' },
  { value: '/images/coupe.png', label: 'COUPE' },
  { value: '/images/nick&nora.png', label: 'NICK & NORA' },
  { value: '/images/tiki.png', label: 'TIKI' },
];

export default function AdminClient({
  menuData,
  openingHours,
}: {
  menuData: MenuCategory[];
  openingHours: OpeningHour[];
}) {
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Local, optimistic copy of the menu so items can be reordered with the
  // Up/Down controls before a "Lagre rekkefølge" save is triggered.
  const [localCategories, setLocalCategories] = useState<MenuCategory[]>(menuData);
  const [modifiedCategories, setModifiedCategories] = useState<Set<string>>(new Set());

  // Re-sync local state whenever fresh server data comes in (e.g. after a
  // revalidation from any of the server actions).
  useEffect(() => {
    setLocalCategories(menuData);
    setModifiedCategories(new Set());
  }, [menuData]);

  function moveItem(categoryId: string, currentIndex: number, direction: 'up' | 'down') {
    setLocalCategories((prev) => {
      const catIndex = prev.findIndex((c) => c.id === categoryId);
      if (catIndex === -1) return prev;

      const items = [...prev[catIndex].items];
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= items.length) return prev;

      [items[currentIndex], items[newIndex]] = [items[newIndex], items[currentIndex]];

      const next = [...prev];
      next[catIndex] = { ...next[catIndex], items };
      return next;
    });

    setModifiedCategories((prev) => new Set(prev).add(categoryId));
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans text-black">
      {/* Header */}
      <header className="mb-16 border-b-4 border-black pb-8 flex flex-wrap justify-between items-end gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--accent-red)] mb-3">
            Taar · Kontrollpanel
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">
            Meny-administrasjon
          </h1>
        </div>
        <div className="text-xs uppercase tracking-widest font-bold border-2 border-black px-4 py-2">
          {localCategories.reduce((sum, c) => sum + c.items.length, 0)} varer · {localCategories.length} kategorier
        </div>
      </header>

      {/* Opening hours */}
      <section className="border-2 border-black mb-14">
        <div className="bg-black text-white px-6 py-4">
          <h2 className="text-lg font-black uppercase tracking-wide">Åpningstider</h2>
        </div>
        <form
          key={openingHours.map((row) => `${row.id}:${row.hours}`).join('|')}
          action={updateOpeningHours}
        >
          {openingHours.map((row) => (
            <div
              key={row.id}
              className="px-6 py-4 flex flex-wrap items-center gap-4 border-t-2 border-black"
            >
              <input type="hidden" name="id" value={row.id} />
              <span className="font-bold uppercase tracking-tight w-28 shrink-0">
                {row.dayName}
              </span>
              <input
                name="hours"
                defaultValue={row.hours}
                required
                className="flex-1 min-w-[140px] border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-red)] transition-colors"
              />
            </div>
          ))}
          <div className="px-6 py-4 border-t-2 border-black flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--accent-red)] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
            >
              Lagre åpningstider
            </button>
          </div>
        </form>
      </section>

      {/* Categories */}
      <div className="flex flex-col gap-14">
        {localCategories.map((category) => {
          const isModified = modifiedCategories.has(category.id);
          const orderedIds = category.items
            .map((item) => item.dbId)
            .filter((id): id is number => typeof id === 'number')
            .join(',');

          return (
          <section key={category.id} className="border-2 border-black">
            <div className="bg-black text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-baseline gap-4">
                <h2 className="text-lg font-black uppercase tracking-wide">
                  {category.category}
                </h2>
                {category.price && (
                  <span className="text-xs uppercase tracking-widest text-white/60">
                    {category.price}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {isModified && (
                  <form
                    action={saveCategoryOrder}
                    onSubmit={() =>
                      setModifiedCategories((prev) => {
                        const next = new Set(prev);
                        next.delete(category.id);
                        return next;
                      })
                    }
                    className="flex"
                  >
                    <input type="hidden" name="categoryId" value={category.dbId ?? ''} />
                    <input type="hidden" name="orderedIds" value={orderedIds} />
                    <button
                      type="submit"
                      className="bg-emerald-500 text-black text-xs font-black uppercase tracking-widest px-4 py-2 border-2 border-emerald-500 hover:bg-black hover:text-emerald-400 transition-colors"
                    >
                      Lagre rekkefølge
                    </button>
                  </form>
                )}
                <button
                  type="button"
                  disabled={!category.dbId}
                  onClick={() =>
                    category.dbId &&
                    setAddTarget({ categoryId: category.dbId, categoryName: category.category })
                  }
                  className="shrink-0 bg-white text-black text-xs font-bold uppercase tracking-widest px-4 py-2 hover:bg-[var(--accent-red)] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  + Ny vare
                </button>
              </div>
            </div>

            {category.items.length === 0 ? (
              <p className="px-6 py-8 text-sm uppercase tracking-widest text-black/40">
                Ingen varer i denne kategorien
              </p>
            ) : (
              <div>
                {category.items.map((item, idx) => (
                  <div
                    key={item.dbId ?? idx}
                    className="px-6 py-5 flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4 border-t-2 border-black"
                  >
                    {/* Ordering controls */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(category.id, idx, 'up')}
                        disabled={idx === 0}
                        className="w-7 h-7 flex items-center justify-center border-2 border-black text-xs font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none"
                        aria-label="Flytt opp"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(category.id, idx, 'down')}
                        disabled={idx === category.items.length - 1}
                        className="w-7 h-7 flex items-center justify-center border-2 border-black text-xs font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-20 disabled:pointer-events-none"
                        aria-label="Flytt ned"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Item info */}
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="font-bold uppercase tracking-tight">{item.name}</h3>
                      <div className="text-xs uppercase tracking-widest text-black/50 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        {item.price && <span>{item.price}</span>}
                        {item.imagePath && <span>{item.imagePath.split('/').pop()}</span>}
                      </div>
                      {(item.ingredients || item.subtitle || item.flavor) && (
                        <p className="text-xs text-black/60 mt-2 leading-relaxed max-w-xl">
                          {item.ingredients || item.subtitle || item.flavor}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={!item.dbId}
                        onClick={() => item.dbId && setEditTarget({ ...item, dbId: item.dbId })}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Rediger
                      </button>
                      <button
                        type="button"
                        disabled={!item.dbId}
                        onClick={() => item.dbId && setPendingDeleteId(item.dbId)}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Slett
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          );
        })}
      </div>

      {/* Edit modal */}
      {editTarget && (
        <Modal title={`Rediger · ${editTarget.name}`} onClose={() => setEditTarget(null)}>
          <form
            action={updateMenuItem}
            onSubmit={() => setEditTarget(null)}
            className="flex flex-col gap-5"
          >
            <input type="hidden" name="id" value={editTarget.dbId} />
            <ItemFields item={editTarget} />
            <FormActions submitLabel="Lagre endringer" onCancel={() => setEditTarget(null)} />
          </form>
        </Modal>
      )}

      {/* Add modal */}
      {addTarget && (
        <Modal title={`Ny vare · ${addTarget.categoryName}`} onClose={() => setAddTarget(null)}>
          <form
            action={addMenuItem}
            onSubmit={() => setAddTarget(null)}
            className="flex flex-col gap-5"
          >
            <input type="hidden" name="categoryId" value={addTarget.categoryId} />
            <ItemFields item={{ name: '' }} />
            <FormActions submitLabel="Legg til vare" onCancel={() => setAddTarget(null)} />
          </form>
        </Modal>
      )}

      {/* Delete confirmation */}
      {pendingDeleteId !== null && (
        <Modal title="Bekreft sletting" onClose={() => setPendingDeleteId(null)}>
          <p className="text-sm text-black/70 mb-6">
            Er du sikker på at du vil slette denne varen? Dette kan ikke angres.
          </p>
          <form
            action={deleteMenuItem}
            onSubmit={() => setPendingDeleteId(null)}
            className="flex justify-end gap-3"
          >
            <input type="hidden" name="id" value={pendingDeleteId} />
            <button
              type="button"
              onClick={() => setPendingDeleteId(null)}
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--accent-red)] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
            >
              Slett vare
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg shadow-[8px_8px_0_0_#000]">
        <div className="bg-black text-white px-6 py-4 flex justify-between items-center gap-4">
          <h3 className="font-black uppercase tracking-wide text-sm">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white text-lg leading-none"
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ItemFields({ item }: { item: MenuItem }) {
  return (
    <>
      <Field label="Navn" name="name" defaultValue={item.name} required />
      <Field label="Pris" name="price" defaultValue={item.price} placeholder="F.eks. kr 189,-" />
      <Field
        label="Smaksnotat (cocktails)"
        name="flavor"
        defaultValue={item.flavor}
        placeholder="F.eks. Frisk, urtepreget, syrlig"
      />
      <Field
        label="Format (øl/vin/alkoholfritt)"
        name="subtitle"
        defaultValue={item.subtitle}
        placeholder="F.eks. 0,4 l på tapp"
      />
      <TextAreaField
        label="Ingredienser"
        name="ingredients"
        defaultValue={item.ingredients}
      />
      <label className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-widest">Bilde / Glass</span>
        <select
          name="imagePath"
          defaultValue={item.imagePath || ''}
          className="border-2 border-black bg-white px-3 py-3 text-sm focus:outline-none focus:border-[var(--accent-red)] transition-colors"
        >
          {IMAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        required={required}
        className="border-2 border-black bg-white px-3 py-3 text-sm focus:outline-none focus:border-[var(--accent-red)] transition-colors"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue || ''}
        className="border-2 border-black bg-white px-3 py-3 text-sm min-h-[90px] focus:outline-none focus:border-[var(--accent-red)] transition-colors"
      />
    </label>
  );
}

function FormActions({
  submitLabel,
  onCancel,
}: {
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="mt-2 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-3 text-xs font-bold uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors"
      >
        Avbryt
      </button>
      <button
        type="submit"
        className="px-6 py-3 bg-[var(--accent-red)] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
      >
        {submitLabel}
      </button>
    </div>
  );
}
