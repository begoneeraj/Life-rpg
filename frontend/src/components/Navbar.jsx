import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../store/useStore';
import CharacterAvatar from './character/CharacterAvatar';

const links = [
  { to: '/guild', label: 'Guild' },
  { to: '/character', label: 'Character' },
  { to: '/quests', label: 'Quests' },
  { to: '/shop', label: 'Armory' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/profile', label: 'Profile' },
];

/**
 * App shell header. Desktop: brand → links → character mini-avatar,
 * level + gold chips, logout. Mobile (<sm): brand → hamburger, which
 * opens a right-side drawer with the same destinations plus the
 * player summary. Route changes and Escape close the drawer; body
 * scroll is locked while it is open.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore((s) => s.logout);
  const character = useStore((s) => s.character);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes (link taps inside it included).
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll and bind Escape while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    document.body.classList.add('drawer-open');
    function onKeyDown(e) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.classList.remove('drawer-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  async function handleLogout() {
    setDrawerOpen(false);
    await logout();
    navigate('/login');
  }

  const equipped = character?.equippedItems || {};

  const avatarProps = {
    gender: character?.gender,
    physique: character?.physique,
    skinTone: character?.skinTone,
    faceType: character?.faceType,
    eyeColor: character?.eyeColor,
    hairStyle: character?.hairStyle,
    hairColor: character?.hairColor,
    facialHair: character?.facialHair,
    skinDetail: character?.skinDetail,
    equippedTop: equipped.top,
    equippedBottom: equipped.bottom,
    equippedShoes: equipped.shoes,
    equippedAccessory: equipped.accessory,
    equippedSpecial: equipped.special,
    topPrimaryColor: character?.topPrimaryColor,
    topAccentColor: character?.topAccentColor,
    bottomPrimaryColor: character?.bottomPrimaryColor,
    bottomAccentColor: character?.bottomAccentColor,
    shoesPrimaryColor: character?.shoesPrimaryColor,
    shoesAccentColor: character?.shoesAccentColor,
    level: character?.level ?? 1,
  };

  const desktopLinkClass = ({ isActive }) =>
    `rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-3 ${
      isActive
        ? 'bg-dungeon-700 text-gold-400'
        : 'text-parchment-200/80 hover:bg-dungeon-800 hover:text-parchment-100'
    }`;

  const drawerLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive
        ? 'border border-gold-500/40 bg-dungeon-700 text-gold-400'
        : 'border border-transparent text-parchment-200/80 hover:bg-dungeon-800 hover:text-parchment-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-dungeon-700/60 bg-dungeon-950/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl drop-shadow-[0_0_8px_rgba(232,200,116,0.45)]">
            ⚔️
          </span>
          <span className="font-display text-lg font-bold tracking-wide text-gold-400">
            Life RPG
          </span>
        </div>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          {character && (
            <>
              {/* Player identity: mini avatar links to the character page. */}
              <Link
                to="/character"
                aria-label="View your character"
                className="hidden h-10 w-9 shrink-0 overflow-hidden rounded-md border border-gold-500/40 bg-dungeon-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-glow sm:block"
              >
                <CharacterAvatar {...avatarProps} idle={false} className="h-full w-full" />
              </Link>
              <span
                className="hidden items-center rounded-full border border-mystic-600/40 bg-dungeon-800 px-2.5 py-1 text-xs font-semibold text-mystic-400 sm:inline-flex"
                aria-label={`Level ${character.level}`}
              >
                Lv {character.level}
              </span>
              <span
                className="hidden items-center gap-1 rounded-full border border-gold-600/40 bg-dungeon-800 px-3 py-1 text-xs font-semibold text-gold-400 sm:inline-flex"
                aria-label={`${character.gold} gold`}
              >
                🪙 {character.gold}
              </span>
            </>
          )}
          <button type="button" className="btn-secondary hidden text-xs sm:inline-flex" onClick={handleLogout}>
            Log out
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="btn-secondary inline-flex px-2.5 py-1.5 sm:hidden"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setDrawerOpen((o) => !o)}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {drawerOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              className="fixed inset-0 z-50 bg-dungeon-950/70 backdrop-blur-sm sm:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="drawer-panel"
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
              className="fixed inset-y-0 right-0 z-50 flex w-64 max-w-[82vw] flex-col border-l border-dungeon-600/60 bg-dungeon-900 shadow-card-lg sm:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b border-dungeon-700/60 px-4 py-3">
                <span className="flex items-center gap-2 font-display text-base font-bold text-gold-400">
                  <span aria-hidden="true">⚔️</span> Life RPG
                </span>
                <button
                  type="button"
                  className="btn-secondary px-2 py-1 text-xs"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                >
                  ✕
                </button>
              </div>

              {character && (
                <div className="flex items-center gap-3 border-b border-dungeon-700/60 bg-dungeon-850/60 px-4 py-3">
                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md border border-gold-500/40 bg-dungeon-900">
                    <CharacterAvatar {...avatarProps} idle={false} className="h-full w-full" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-parchment-100">
                      Level {character.level} Adventurer
                    </p>
                    <p className="text-xs font-semibold text-gold-400">🪙 {character.gold} Gold</p>
                  </div>
                </div>
              )}

              <nav aria-label="Mobile navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={drawerLinkClass}>
                    <span>{link.label}</span>
                    <span aria-hidden="true" className="text-parchment-300/40">
                      ›
                    </span>
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-dungeon-700/60 p-3">
                <button type="button" className="btn-secondary w-full text-xs" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
