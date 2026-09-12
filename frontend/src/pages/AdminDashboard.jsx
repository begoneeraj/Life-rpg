import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogout, fetchAdminMe } from '../api/adminAuth';

/**
 * Placeholder landing page after a successful hidden-admin login. No
 * admin-only functionality exists yet - this just confirms the session
 * works and gives a way to log out. Checks /api/admin/me on mount and
 * bounces back to /nitinji if the admin cookie is missing/expired.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'denied'

  useEffect(() => {
    fetchAdminMe()
      .then(() => setStatus('ok'))
      .catch(() => {
        setStatus('denied');
        navigate('/nitinji', { replace: true });
      });
  }, [navigate]);

  async function handleLogout() {
    await adminLogout();
    navigate('/nitinji', { replace: true });
  }

  if (status !== 'ok') {
    return <div className="flex min-h-screen items-center justify-center bg-black text-gray-500">…</div>;
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 font-mono text-gray-200">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Admin</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-red-500 hover:text-red-400"
          >
            Log out
          </button>
        </div>

        <div className="rounded border border-gray-700 bg-gray-900 p-6 text-sm text-gray-400">
          Logged in. There's no admin-only functionality wired up yet — this is just the session
          gate. Tell me what this should be able to do (view all users? edit the item catalog?
          moderate quests?) and I'll build it here.
        </div>
      </div>
    </div>
  );
}
