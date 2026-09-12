import { NavLink, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const links = [
  { to: '/guild', label: 'Guild' },
  { to: '/quests', label: 'Quests' },
  { to: '/shop', label: 'Shop' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const character = useStore((s) => s.character);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-dungeon-700/60 bg-dungeon-950/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">
            ⚔️
          </span>
          <span className="font-display text-lg font-bold text-gold-400">Life RPG</span>
        </div>

        <ul className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-3 ${
                    isActive
                      ? 'bg-dungeon-700 text-gold-400'
                      : 'text-parchment-200/80 hover:bg-dungeon-800 hover:text-parchment-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {character && (
            <span
              className="hidden items-center gap-1 rounded-full border border-gold-600/40 bg-dungeon-800 px-3 py-1 text-xs font-semibold text-gold-400 sm:flex"
              aria-label={`${character.gold} gold`}
            >
              🪙 {character.gold}
            </span>
          )}
          <button type="button" className="btn-secondary text-xs" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
