import { getMenuData } from '@/lib/dal';
import AdminClient from './AdminClient';

// Admin data must always be fresh — never serve a cached/stale menu snapshot.
export const dynamic = 'force-dynamic';

// Access to this route is gated by middleware.ts, which checks the
// `admin_session` cookie set by app/login/actions.ts.

export default async function AdminPage() {
  const menuData = await getMenuData();

  return (
    <main className="min-h-screen bg-white selection:bg-[var(--accent-red)] selection:text-white">
      <AdminClient menuData={menuData} />
    </main>
  );
}
