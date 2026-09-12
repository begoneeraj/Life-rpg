import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../store/useStore';
import CharacterAvatar from './character/CharacterAvatar';

// Cohesive inline SVG icon set (no icon-library dependency). Stroke-based,
// 24px grid, inheriting currentColor so hover/active tinting works for free.
const ICONS = {
  guild: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" />
    </svg>
  ),
  character: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3l12 9-5 1 3 6-2 1-3-6-4 3z" />
    </svg>
  ),
  quests: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6" />
    </svg>
  ),
  armory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h16l-1.5 12h-13z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  ),
};

const links = [
  { to: '/guild', label: 'Guild', icon: ICONS.guild },
  { to: '/character', label: 'Character', icon: ICONS.character },
  { to: '/quests', label: 'Quests', icon: ICONS.quests },
  { to: '/shop', label: 'Armory', icon: ICONS.armory },
  { to: '/inventory', label: 'Inventory', icon: ICONS.inventory },
  { to: '/profile', label: 'Profile', icon: ICONS.profile },
];

/**
 * Navbar — the player's permanent RPG HUD.
 *
 * Desktop: game-logo brand → icon+label game-menu items (active item = gold
 * bracketed selection with glow) → player identity (mini avatar + LV badge
 * + gold counter) → ember EXIT GAME. Header is sticky and gains a more
 * solid "solidified HUD" treatment once the page scrolls.
 *
 * Mobile/tablet (<md): brand + compact LV/gold chips + hamburger opening a
 * right-side drawer with the player summary card, icon menu, and exit.
 * Route change / Escape / backdrop click all close it; body scroll locks.
 *
 * Presentation only — routes, logout, and store usage unchanged.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useStore((s) => s.logout);
  const character = useStore((s) => s.character);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close the drawer whenever the route changes (link taps inside it included).
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll + bind Escape while the drawer is open.
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

  // Scroll-aware HUD: solidify slightly once the page leaves the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    `group relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-bold uppercase tracking-wider transition-all duration-150 ${
      isActive
        ? 'bg-dungeon-700/80 text-gold-400 shadow-[inset_0_1px_0_rgba(245,236,215,0.06),0_0_14px_rgba(212,175,55,0.12)]'
        : 'text-parchment-200/75 hover:bg-dungeon-800 hover:text-parchment-100 active:translate-y-px'
    }`;

  const drawerLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-150 ${
      isActive
        ? 'border-gold-500/50 bg-dungeon-700 text-gold-400 shadow-[0_0_16px_rgba(212,175,55,0.12)]'
        : 'border-transparent text-parchment-200/80 hover:border-dungeon-500 hover:bg-dungeon-800 hover:text-parchment-100 active:translate-y-px'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        scrolled ? 'border-dungeon-600/80 bg-dungeon-950/97 shadow-card' : 'border-dungeon-700/60 bg-dungeon-950/88 backdrop-blur'
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5"
      >
        {/* --- Brand: game logo --- */}
        <Link
          to="/guild"
          className="group flex shrink-0 items-center gap-2 rounded-md px-1 py-0.5 transition-transform duration-150 active:translate-y-px"
          aria-label="Life RPG — Guild home"
        >
          <span aria-hidden="true" className="text-xl drop-shadow-[0_0_10px_rgba(232,200,116,0.5)]">
            ⚔️
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold tracking-[0.08em] text-gold-400 drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]">
              LIFE RPG
            </span>
            <span className="font-hud mt-0.5 text-[8px] uppercase tracking-[0.3em] text-parchment-300/50">
              Real life · Real XP
            </span>
          </span>
        </Link>

        {/* --- Desktop game-menu items --- */}
        <ul className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={desktopLinkClass}>
                <span aria-hidden="true" className="h-4 w-4 [&>svg]:h-full [&>svg]:w-full">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* --- Player status HUD --- */}
        <div className="flex items-center gap-2">
          {character && (
            <>
              <Link
                to="/character"
                aria-label="View your character"
                className="hidden h-9 w-8 shrink-0 overflow-hidden rounded-md border border-gold-500/40 bg-dungeon-900 transition-all duration-150 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-glow md:block"
              >
                <CharacterAvatar {...avatarProps} idle={false} className="h-full w-full" />
              </Link>
              <span
                className="hud-badge font-hud border-gold-500/50 bg-dungeon-900 text-gold-400"
                aria-label={`Level ${character.level}`}
              >
                <span aria-hidden="true" className="text-[8px] text-gold-500/80">◈</span>
                LV {character.level}
              </span>
              <span
                className="hud-badge font-hud hidden border-gold-600/40 bg-dungeon-900 text-gold-400 sm:inline-flex"
                aria-label={`${character.gold} gold`}
              >
                <span aria-hidden="true">🪙</span>
                {character.gold.toLocaleString()}
                <span className="text-parchment-300/50">GOLD</span>
              </span>
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-md border border-ember-600/40 bg-dungeon-900 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ember-400/90 transition-all duration-150 hover:border-ember-500 hover:bg-ember-600/10 hover:text-ember-300 active:translate-y-px md:inline-flex"
          >
            Exit Game
          </button>

          {/* --- Mobile hamburger --- */}
          <button
            type="button"
            className="btn-game inline-flex px-2.5 py-1.5 md:hidden"
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

      {/* --- Mobile/tablet drawer --- */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              className="fixed inset-0 z-50 bg-dungeon-950/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="drawer-panel"
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
              className="game-panel fixed inset-y-0 right-0 z-50 flex w-64 max-w-[82vw] flex-col rounded-none border-y-0 border-r-0 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b border-dungeon-700/60 px-4 py-3">
                <span className="flex items-center gap-2 font-display text-base font-extrabold tracking-[0.08em] text-gold-400">
                  <span aria-hidden="true">⚔️</span> LIFE RPG
                </span>
                <button
                  type="button"
                  className="btn-game px-2 py-1"
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
                    <p className="font-hud text-sm text-gold-400">LV {character.level} Adventurer</p>
                    <p className="font-hud text-xs text-parchment-300/70">
                      🪙 {character.gold.toLocaleString()} Gold
                    </p>
                  </div>
                </div>
              )}

              <nav aria-label="Mobile navigation" className="flex-1 space-y-1 overflow-y-auto p-3">
                {links.map((link) => (
                  <NavLink key={link.to} to={link.to} className={drawerLinkClass}>
                    <span aria-hidden="true" className="h-4 w-4 shrink-0 [&>svg]:h-full [&>svg]:w-full">
                      {link.icon}
                    </span>
                    <span className="flex-1">{link.label}</span>
                    <span aria-hidden="true" className="text-parchment-300/40">
                      ›
                    </span>
                  </NavLink>
                ))}
              </nav>

              <div className="border-t border-dungeon-700/60 p-3">
                <button
                  type="button"
                  className="w-full rounded-md border border-ember-600/40 bg-dungeon-900 px-3 py-2 text-xs font-bold uppercase tracking-wider text-ember-400/90 transition-colors hover:border-ember-500 hover:bg-ember-600/10 hover:text-ember-300"
                  onClick={handleLogout}
                >
                  Exit Game
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
