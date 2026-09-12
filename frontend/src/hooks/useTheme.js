import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'liferpg-theme';
const ANIM_CLASS = 'theme-anim';
let animTimer;

/** Applies the theme to <html>; optionally plays the 220ms paint transition. */
function applyTheme(theme, animate = false) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add(ANIM_CLASS);
    clearTimeout(animTimer);
    animTimer = setTimeout(() => root.classList.remove(ANIM_CLASS), 260);
  }
  root.setAttribute('data-theme', theme);
}

function readInitialTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage unavailable (private mode) — fall through */
  }
  return 'dark';
}

/**
 * Shell-scoped theme state, persisted to localStorage.
 *
 * Scope note: only the authenticated AppShell mounts this hook. Login/Signup
 * never do — and the shell resets <html> back to dark on unmount (logout), so
 * the auth screens keep their exact original presentation regardless of the
 * player's in-game theme choice.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme);
  const mounted = useRef(false);

  useEffect(() => {
    // Animate only user-initiated switches, not the initial mount.
    applyTheme(theme, mounted.current);
    mounted.current = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore persistence failures */
    }

    // Scope: reset <html> back to dark when the shell unmounts (logout →
    // /login) so the auth screens always render their original night look.
    // The stored preference is kept and re-applied when the shell remounts.
    return () => {
      document.documentElement.setAttribute('data-theme', 'dark');
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
