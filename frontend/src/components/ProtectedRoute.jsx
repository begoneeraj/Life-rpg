import { Navigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';

/**
 * Gates a route behind auth, and behind character creation: a signed-in
 * user whose character hasn't been created yet is bounced to
 * /character/create before they can reach anything else in the app.
 */
export default function ProtectedRoute({ children }) {
  const authStatus = useStore((s) => s.authStatus);
  const character = useStore((s) => s.character);
  const location = useLocation();

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
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (character && !character.createdCharacter && location.pathname !== '/character/create') {
    return <Navigate to="/character/create" replace />;
  }

  return children;
}
