/**
 * Derives a presentable player name from the REAL account email handle.
 *
 * The backend user model stores only `email` (no name/username field), so
 * instead of showing a raw email as the player identity, we prettify the
 * handle: "tyzenoccali@gmail.com" -> "Tyzenoccali". Nothing is invented —
 * every character comes from the actual account — and when there is no
 * email at all we fall back to the neutral "Adventurer".
 */
export default function displayName(user) {
  const email = user?.email;
  if (!email || typeof email !== 'string') return 'Adventurer';

  const handle = email.split('@')[0] || '';
  const words = handle
    .replace(/[._\-+]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return 'Adventurer';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
