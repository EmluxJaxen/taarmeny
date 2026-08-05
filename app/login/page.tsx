'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(authenticate, null);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6 font-sans text-black selection:bg-[var(--accent-red)] selection:text-white">
      <div className="w-full max-w-md border-4 border-black shadow-[8px_8px_0_0_#000]">
        <div className="bg-black text-white px-8 py-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--accent-red)] mb-2">
            Taar · Kontrollpanel
          </p>
          <h1 className="font-serif text-2xl font-bold">Sikkerhetssone</h1>
        </div>

        <form action={formAction} className="flex flex-col gap-5 p-8">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest">Passord</span>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="border-2 border-black bg-white px-3 py-3 text-sm focus:outline-none focus:border-[var(--accent-red)] transition-colors"
            />
          </label>

          {state?.error && (
            <p className="text-[var(--accent-red)] text-xs font-bold uppercase tracking-widest text-center">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 bg-[var(--accent-red)] text-white text-xs font-bold uppercase tracking-widest px-6 py-4 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Verifiserer...' : 'Logg inn'}
          </button>
        </form>
      </div>
    </main>
  );
}
