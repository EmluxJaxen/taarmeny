'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, max } from 'drizzle-orm';
import { db } from '@/db/client';
import { menuItems } from '@/db/schema';

function revalidateMenuPaths() {
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/menyprint');
}

function readItemFields(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    throw new Error('Navn er påkrevd');
  }

  return {
    name,
    price: ((formData.get('price') as string) ?? '').trim() || null,
    flavor: ((formData.get('flavor') as string) ?? '').trim() || null,
    subtitle: ((formData.get('subtitle') as string) ?? '').trim() || null,
    ingredients: ((formData.get('ingredients') as string) ?? '').trim() || null,
    imagePath: ((formData.get('imagePath') as string) ?? '').trim() || null,
  };
}

export async function updateMenuItem(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) {
    throw new Error('Ugyldig vare-id');
  }

  const fields = readItemFields(formData);

  await db.update(menuItems).set(fields).where(eq(menuItems.id, id));

  revalidateMenuPaths();
}

export async function addMenuItem(formData: FormData) {
  const categoryId = Number(formData.get('categoryId'));
  if (!Number.isInteger(categoryId)) {
    throw new Error('Ugyldig kategori-id');
  }

  const fields = readItemFields(formData);

  // Place new items at the end of their category.
  const [{ value: currentMax }] = await db
    .select({ value: max(menuItems.sortOrder) })
    .from(menuItems)
    .where(eq(menuItems.categoryId, categoryId));

  await db.insert(menuItems).values({
    categoryId,
    ...fields,
    sortOrder: (currentMax ?? -1) + 1,
  });

  revalidateMenuPaths();
}

export async function deleteMenuItem(formData: FormData) {
  const id = Number(formData.get('id'));
  if (!Number.isInteger(id)) {
    throw new Error('Ugyldig vare-id');
  }

  await db.delete(menuItems).where(eq(menuItems.id, id));

  revalidateMenuPaths();
}

export async function saveCategoryOrder(formData: FormData) {
  const categoryId = Number(formData.get('categoryId'));
  const orderedIdsRaw = formData.get('orderedIds'); // comma-separated string of item ids

  if (!Number.isInteger(categoryId) || !orderedIdsRaw) {
    throw new Error('Mangler påkrevde felter for rekkefølge');
  }

  const orderedIds = String(orderedIdsRaw)
    .split(',')
    .map(Number)
    .filter((id) => Number.isInteger(id));

  if (orderedIds.length === 0) {
    throw new Error('Ingen varer å sortere');
  }

  await db.transaction(async (tx) => {
    for (const [index, itemId] of orderedIds.entries()) {
      await tx
        .update(menuItems)
        .set({ sortOrder: index })
        .where(and(eq(menuItems.id, itemId), eq(menuItems.categoryId, categoryId)));
    }
  });

  revalidateMenuPaths();
}
