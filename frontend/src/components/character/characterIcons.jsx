/**
 * Character-screen icon set — same visual language as components/ui/icons.jsx
 * (24px grid, ~1.8 stroke, currentColor) but scoped to equipment slots and
 * character customization actions so we never block on the shared file
 * (parallel-track file ownership).
 *
 * Usage: <SlotIcon name="head" className="h-4 w-4" />
 * Decorative by default (aria-hidden) — pair with a visible label.
 */

const PATHS = {
  // --- equipment slots ---
  head: (
    <>
      <path d="M4.5 13a7.5 7.5 0 0 1 15 0v4.5a2 2 0 0 1-2 2h-1.5l-1-3h-6l-1 3H6.5a2 2 0 0 1-2-2z" />
      <path d="M9.5 12h1.5M13.5 12H15" />
    </>
  ),
  top: <path d="M8 4l4 2 4-2 4 4-2.5 2.5L16 9v11H8V9l-1.5 1.5L4 8z" />,
  legs: <path d="M7 3h10l-1 8 1.5 10h-4L12 12l-1.5 9h-4L8 11z" />,
  shoes: (
    <>
      <path d="M4 16v-4l4-1 3-4 5 1c2.5.5 4 2.5 4 5v3z" />
      <path d="M4 16h16M9 11h.01M13 12h.01" />
    </>
  ),
  accessory: (
    <>
      <circle cx="12" cy="9" r="4" />
      <path d="M9.5 12.5L8 20l4-2 4 2-1.5-7.5" />
    </>
  ),
  special: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  // Helmet silhouette — matches components/ui/icons.jsx so section headers
  // can reference the "character" glyph with the same visual language.
  character: (
    <>
      <path d="M4 13a8 8 0 0 1 16 0v6a2 2 0 0 1-2 2h-2l-1-4h-6l-1 4H6a2 2 0 0 1-2-2z" />
      <path d="M9 11h2M13 11h2" />
    </>
  ),
  dye: (
    <>
      <path d="M6 12l6-6 6 6-6 6z" />
      <path d="M12 3v3" />
      <path d="M9 21h6" />
    </>
  ),

  // --- actions ---
  rotateLeft: (
    <>
      <path d="M4 10a8 8 0 1 1 2.3 6.3" />
      <path d="M4 5v5h5" />
    </>
  ),
  rotateRight: (
    <>
      <path d="M20 10a8 8 0 1 0-2.3 6.3" />
      <path d="M20 5v5h-5" />
    </>
  ),
  lock: (
    <>
      <rect x="6" y="11" width="12" height="9" rx="1.5" />
      <path d="M9 11V8a3 3 0 0 1 6 0v3" />
      <circle cx="12" cy="15.5" r="1" />
    </>
  ),
  chevronLeft: <path d="M14 6l-6 6 6 6" />,
  chevronRight: <path d="M10 6l6 6-6 6" />,
  spark: <path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z" />,
};

export default function SlotIcon({ name, className = 'h-4 w-4' }) {
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
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
