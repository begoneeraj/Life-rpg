import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useStore from '../store/useStore';
import useTheme from '../hooks/useTheme';
import displayName from '../utils/displayName';
import Icon from './ui/icons';
import ThemeToggle from './ui/ThemeToggle';
import CharacterAvatar from './character/CharacterAvatar';

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { to: '/guild', label: 'Guild', icon: 'guild' },
      { to: '/character', label: 'Character', icon: 'character' },
      { to: '/quests', label: 'Quests', icon: 'quests' },
      { to: '/routine', label: 'Routine', icon: 'routine' },
    ],
  },
  {
    title: 'Collection',
    items: [
      { to: '/shop', label: 'Armory', icon: 'armory' },
      { to: '/inventory', label: 'Inventory', icon: 'inventory' },
    ],
  },
  {
    title: 'Player',
    items: [{ to: '/profile', label: 'Profile', icon: 'profile' }],
  },
];

/** Page-transition variants: quick, directional, restrained (150–250ms). */
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

/**
 * AppShell — the R1 authenticated game application frame.
 *
 * Desktop (≥lg): fixed left game-menu sidebar + wide main column with the
 * player HUD strip on top. 1024–1279px uses the compact icon rail.
 * <1024px: top HUD + slide-in navigation drawer.
 *
 * Theme note: this is the only component mounting useTheme, so light mode
 * never leaks onto Login/Signup; on logout (unmount) <html> resets to dark.
 */
export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const character = useStore((s) => s.character);
  const user = useStore((s) => s.user);
  const { theme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Body scroll lock + Escape while the drawer is open.
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

  /* ---------- shared HUD pieces ---------- */

  const goldBadge = character && (
    <span
      className="hud-badge font-hud border-gold-600/40 bg-dungeon-900/80 text-gold-400"
      aria-label={`${character.gold} gold`}
    >
      <Icon name="coin" className="h-3 w-3" />
      {/* Keyed remount slides the numeral in whenever the REAL gold value
          changes — a quiet "value changed" tick, not a casino effect. */}
      <motion.span
        key={character.gold}
        initial={{ y: 7, opacity: 0.3 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="inline-block"
      >
        {character.gold.toLocaleString()}
      </motion.span>
    </span>
  );

  const playerBlock = character && (
    <div className="flex items-center gap-2">
      <span
        className="hud-badge font-hud border-gold-500/50 bg-dungeon-900/80 text-gold-400"
        aria-label={`Level ${character.level}`}
      >
        <Icon name="xp" className="h-3 w-3 text-gold-500/90" />
        LV {character.level}
      </span>
      {/* compact XP strip (md+): the reference HUD reads PLAYER · LV · XP · GOLD.
          Same real XP math as XPBar, presented as a slim always-visible gauge. */}
      <span
        className="hidden w-28 md:block"
        role="progressbar"
        aria-valuenow={Math.min(100, Math.round((character.currentXP / Math.round(100 * Math.pow(character.level, 1.5))) * 100))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Experience: ${character.currentXP} of ${Math.round(100 * Math.pow(character.level, 1.5))} XP toward level ${character.level + 1}`}
      >
        <span className="relative block h-2 overflow-hidden rounded-full border border-dungeon-600 bg-dungeon-950">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-xp-600 to-xp-400 shadow-glow-xp"
            style={{ width: `${Math.min(100, Math.round((character.currentXP / Math.round(100 * Math.pow(character.level, 1.5))) * 100))}%` }}
          />
        </span>
      </span>
      <Link
        to="/profile"
        aria-label="Open your profile"
        className="h-9 w-8 shrink-0 overflow-hidden rounded-md border border-gold-500/40 bg-dungeon-900 transition-all duration-150 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-glow"
      >
        <CharacterAvatar {...avatarProps} idle={false} className="h-full w-full" />
      </Link>
    </div>
  );

  const themeToggle = <ThemeToggle theme={theme} onChange={setTheme} />;

  /* ---------- sidebar ---------- */

  const sidebarNav = (
    <nav aria-label="Primary" className="flex-1 overflow-y-auto pb-4">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          {section.title !== 'Main' && <div className="sidebar-divider" aria-hidden="true" />}
          <p className="sidebar-section">{section.title}</p>
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="sidebar-link group"
                  title={item.label}
                  aria-label={item.label}
                >
                  <span className="sidebar-icon [&>svg]:h-full [&>svg]:w-full">
                    <Icon name={item.icon} className="h-full w-full" />
                  </span>
                  <span className="truncate">{item.label}</span>
                  <Icon
                    name="chevron"
                    className="ml-auto hidden h-3.5 w-3.5 text-parchment-300/30 transition-opacity opacity-0 group-hover:opacity-100 lg:block"
                  />
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const sidebarFooter = character && (
    <div className="space-y-2 border-t border-dungeon-700/50 p-3">
      <div className="hud-strip">
        <span className="hud-badge font-hud border-gold-500/50 bg-dungeon-800/80 text-gold-400">
          LV {character.level}
        </span>
        <span
          className="hud-badge font-hud ml-auto border-gold-600/40 bg-dungeon-800/80 text-gold-400"
          aria-label={`${character.gold} gold`}
        >
          <Icon name="coin" className="h-3 w-3" />
          {character.gold.toLocaleString()}
        </span>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="hidden w-full items-center justify-center gap-2 rounded-md border border-ember-600/40 bg-dungeon-900/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ember-400/90 transition-colors hover:border-ember-500 hover:bg-ember-600/10 hover:text-ember-300 lg:flex"
      >
        <Icon name="logout" className="h-3.5 w-3.5" /> Exit Game
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* ---------------- top HUD (all sizes) ---------------- */}
      <header className="rpg-topbar sticky top-0 z-40">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="theme-toggle lg:hidden"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen((o) => !o)}
          >
            <Icon name={drawerOpen ? 'close' : 'menu'} className="h-4 w-4" />
          </button>

          <Link
            to="/guild"
            className="flex shrink-0 items-center gap-2"
            aria-label="Life RPG — Guild home"
          >
            <Icon name="sword" className="h-5 w-5 text-gold-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="font-display text-base font-extrabold tracking-[0.1em] text-gold-400">
              LIFE RPG
            </span>
          </Link>

          <span
            aria-hidden="true"
            className="mx-1 hidden h-6 border-l border-dungeon-600/60 sm:block"
          />

          <Link
            to="/quests"
            className="rpg-command hidden min-w-0 flex-1 items-center gap-2 md:flex"
            aria-label="Create a new quest"
          >
            <Icon name="quests" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Create your next quest</span>
            <span className="ml-auto font-hud text-[10px] text-gold-500">+</span>
          </Link>

          {/* HUD readouts */}
          <div className="ml-auto flex items-center gap-2">
            {goldBadge}
            {playerBlock}
            {themeToggle}
          </div>
        </div>
      </header>

      {/* ---------------- sidebar (desktop) ---------------- */}
      <aside
        className="rpg-sidebar fixed inset-y-14 left-0 z-30 hidden w-[210px] flex-col lg:flex"
        aria-label="Game menu"
      >
        {sidebarNav}
        {sidebarFooter}
      </aside>

      {/* ---------------- mobile drawer ---------------- */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              className="fixed inset-0 z-50 bg-dungeon-950/60 backdrop-blur-sm lg:hidden"
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
              aria-label="Game menu"
              className="game-panel fixed inset-y-0 left-0 z-50 flex w-72 max-w-[84vw] flex-col rounded-none border-y-0 border-l-0 lg:hidden"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b border-dungeon-700/60 px-4 py-3">
                <span className="flex items-center gap-2 font-display text-base font-extrabold tracking-[0.1em] text-gold-400">
                  <Icon name="sword" className="h-4 w-4" /> LIFE RPG
                </span>
                <button
                  type="button"
                  className="theme-toggle"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Icon name="close" className="h-4 w-4" />
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
                      {displayName(user)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto pb-3">
                {sidebarNav}
              </div>

              <div className="border-t border-dungeon-700/60 p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-ember-600/40 bg-dungeon-900/80 px-3 py-2 text-xs font-bold uppercase tracking-wider text-ember-400/90 transition-colors hover:border-ember-500 hover:bg-ember-600/10 hover:text-ember-300"
                >
                  <Icon name="logout" className="h-3.5 w-3.5" /> Exit Game
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------------- main content ---------------- */}
      <main className="shell-main lg:pl-[210px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
