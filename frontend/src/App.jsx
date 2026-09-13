import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useStore from './store/useStore';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import { Skeleton } from './components/Skeleton';

// Every route used to be bundled into one ~900KB JS file loaded up front,
// even just to show the login screen. Lazy-loading each page means the
// initial load only pays for the route actually being visited (plus
// AppShell/vendor code, split out below in vite.config.js) — the rest
// downloads on demand when the user navigates there.
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Guild = lazy(() => import('./pages/Guild'));
const Quests = lazy(() => import('./pages/Quests'));
const Shop = lazy(() => import('./pages/Shop'));
const Profile = lazy(() => import('./pages/Profile'));
const Character = lazy(() => import('./pages/Character'));
const CharacterCreation = lazy(() => import('./pages/CharacterCreation'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Routine = lazy(() => import('./pages/Routine'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function RouteFallback() {
  return (
    <div className="page-container">
      <Skeleton className="h-[70vh] w-full" />
    </div>
  );
}

function AppLayout() {
  return <AppShell />;
}

export default function App() {
  const bootstrap = useStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'liferpg-toast',
        }}
      />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Hidden admin gate - not linked from any nav, separate auth system. */}
        <Route path="/nitinji" element={<AdminLogin />} />
        <Route path="/nitinji/dashboard" element={<AdminDashboard />} />

        <Route
          path="/character/create"
          element={
            <ProtectedRoute>
              <CharacterCreation />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/guild" element={<Guild />} />
          <Route path="/character" element={<Character />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/" element={<Navigate to="/guild" replace />} />
        <Route path="*" element={<Navigate to="/guild" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
