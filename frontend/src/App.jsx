import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useStore from './store/useStore';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AmbientBackdrop from './components/ui/AmbientBackdrop';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Guild from './pages/Guild';
import Quests from './pages/Quests';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Character from './pages/Character';
import CharacterCreation from './pages/CharacterCreation';
import Inventory from './pages/Inventory';

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
      {/* Ambient dungeon atmosphere behind every screen. */}
      <AmbientBackdrop />
      <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'liferpg-toast',
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/" element={<Navigate to="/guild" replace />} />
        <Route path="*" element={<Navigate to="/guild" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
