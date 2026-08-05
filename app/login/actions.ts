'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hashPassword } from '@/lib/crypto';

export type AuthState = { error: string } | null;

export async function authenticate(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD er ikke satt i miljøvariablene.');
    return { error: 'Serverkonfigurasjonsfeil.' };
  }

  if (typeof password !== 'string' || password !== adminPassword) {
    return { error: 'Ugyldig passord.' };
  }

  // Hash the password before storing it in the cookie
  const hashedSession = await hashPassword(adminPassword);

  const cookieStore = await cookies();
  cookieStore.set('admin_session', hashedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 uke
    path: '/',
  });

  redirect('/admin');
}
