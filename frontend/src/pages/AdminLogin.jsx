import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/adminAuth';

/**
 * Hidden admin gate at /nitinji - deliberately unbranded and not linked
 * from any nav, separate from the real user auth system entirely (its own
 * cookie, its own middleware). Credentials come from ADMIN_USERNAME/
 * ADMIN_PASSWORD env vars on the server, never from source code.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await adminLogin(username, password);
      navigate('/nitinji/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 font-mono text-gray-200">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-xs space-y-4 rounded border border-gray-700 bg-gray-900 p-6">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Admin Access</h1>

        <div>
          <input
            type="text"
            autoComplete="off"
            placeholder="id"
            className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-sm outline-none focus:border-gray-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            autoComplete="off"
            placeholder="password"
            className="w-full rounded border border-gray-700 bg-black px-3 py-2 text-sm outline-none focus:border-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-gray-700 py-2 text-sm font-semibold text-gray-100 transition-colors hover:bg-gray-600 disabled:opacity-50"
        >
          {isSubmitting ? '...' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
