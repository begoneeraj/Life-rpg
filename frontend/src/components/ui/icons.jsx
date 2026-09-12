/**
 * Life RPG icon set — R1 visual language.
 *
 * One coherent, purpose-drawn stroke system (24px grid, 1.8 stroke,
 * currentColor) that replaces the emoji mix. No icon-library dependency —
 * the app already uses inline SVGs (Navbar, character layers), so this
 * formalizes that approach as the single source of truth.
 *
 * Usage: <Icon name="quests" className="h-4 w-4" />
 * Icons are decorative by default (aria-hidden) — pair with visible labels.
 */

const PATHS = {
  // --- navigation destinations ---
  guild: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V10l7-6 7 6v11" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  character: (
    // Helmet silhouette
    <>
      <path d="M4 13a8 8 0 0 1 16 0v6a2 2 0 0 1-2 2h-2l-1-4h-6l-1 4H6a2 2 0 0 1-2-2z" />
      <path d="M9 11h2M13 11h2" />
    </>
  ),
  quests: (
    // Quest scroll with seal
    <>
      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  armory: (
    // Shield with boss
    <>
      <path d="M12 3l7 3v5c0 4.8-3 8.4-7 10-4-1.6-7-5.2-7-10V6z" />
      <circle cx="12" cy="10" r="1.6" />
    </>
  ),
  inventory: (
    // Adventurer's pack
    <>
      <path d="M6 8h12l-1 12H7z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M7 13h10" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" />
    </>
  ),

  // --- shell / actions ---
  logout: (
    <>
      <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 8l-4 4 4 4M6 12h9" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </>
  ),
  moon: (
    <>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
    </>
  ),

  // --- HUD / game data ---
  coin: (
    // Pixel-notched coin (the one intentional fill glyph)
    <path
      fill="currentColor"
      stroke="none"
      d="M9 4h6v2h2v2h2v8h-2v2h-2v2H9v-2H7v-2H5V8h2V6h2zM10 9v6h1v1h2v-1h1V9h-1V8h-2v1z"
    />
  ),
  xp: (
    // Four-point star rune
    <path
      fill="currentColor"
      stroke="none"
      d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"
    />
  ),
  flame: (
    // Streak
    <>
      <path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 1.5.7 2.5 1.5 3C10 8 10.5 5 12 3z" />
    </>
  ),
  sword: (
    <>
      <path d="M6 18l-2 2M5 15l4 4M14 4l6 6-8 8-6-6z" />
      <path d="M12 6l6 6" />
    </>
  ),
  check: (
    <>
      <path d="M5 13l4 4L19 7" />
    </>
  ),
  chevron: (
    <>
      <path d="M9 6l6 6-6 6" />
    </>
  ),
};

export default function Icon({ name, className = 'h-4 w-4', label }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      {path}
    </svg>
  );
}
