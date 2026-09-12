import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

/** Gates a route behind auth. Shows nothing while the initial /auth/me check is in flight. */
export default function ProtectedRoute({ children }) {
  const authStatus = useStore((s) => s.authStatus);

  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dungeon-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (authStatus === 'guest') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
