import useStore from '../store/useStore';
import AttributeRadar from '../components/AttributeRadar';
import XPBar from '../components/XPBar';
import { Skeleton } from '../components/Skeleton';

function xpRequiredForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

const BADGES = [
  { threshold: 3, label: 'Streak Starter', icon: '🔥' },
  { threshold: 7, label: 'Week Warrior', icon: '⚔️' },
  { threshold: 30, label: 'Monthly Legend', icon: '👑' },
];

export default function Profile() {
  const user = useStore((s) => s.user);
  const character = useStore((s) => s.character);

  if (!character) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const earnedBadges = BADGES.filter((b) => character.longestStreak >= b.threshold);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">
        Character Profile
      </h1>

      <div className="parchment-card space-y-4 p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-500 bg-dungeon-900 text-3xl"
            aria-hidden="true"
          >
            🧙
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-parchment-100">
              {user?.email}
            </p>
            <p className="text-xs uppercase tracking-widest text-parchment-300/60">
              Equipped theme: {character.equippedTheme}
            </p>
          </div>
        </div>
        <XPBar
          level={character.level}
          current={character.currentXP}
          required={xpRequiredForLevel(character.level)}
        />
      </div>

      <AttributeRadar character={character} />

      <div className="parchment-card p-6">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
          Badges
        </h2>
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-parchment-300/60">
            No badges yet — build a streak to earn your first one.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {earnedBadges.map((b) => (
              <li
                key={b.label}
                className="flex items-center gap-2 rounded-full border border-gold-600/40 bg-dungeon-800 px-3 py-1.5 text-xs font-semibold text-gold-400"
              >
                <span aria-hidden="true">{b.icon}</span> {b.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="parchment-card grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        <Stat label="Gold" value={character.gold} icon="🪙" />
        <Stat label="Current Streak" value={character.currentStreak} icon="🔥" />
        <Stat label="Longest Streak" value={character.longestStreak} icon="🏅" />
        <Stat label="Items Owned" value={character.ownedItems.length} icon="🎒" />
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="text-center">
      <p className="text-2xl" aria-hidden="true">
        {icon}
      </p>
      <p className="font-display text-xl font-bold text-parchment-100">{value}</p>
      <p className="text-[11px] uppercase tracking-widest text-parchment-300/60">{label}</p>
    </div>
  );
}
