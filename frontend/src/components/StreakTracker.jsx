import Icon from './ui/icons';

export default function StreakTracker({ currentStreak, longestStreak }) {
  const isActive = currentStreak > 0;

  return (
    <div
      className="flex items-center gap-3 px-1 py-1"
      aria-label={`Current streak: ${currentStreak} days. Longest streak: ${longestStreak} days.`}
    >
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 items-center justify-center rounded-md border ${
          isActive
            ? 'border-ember-600/50 bg-ember-500/10 text-ember-400 animate-flicker'
            : 'border-dungeon-600 bg-dungeon-900/80 text-parchment-300/40'
        }`}
      >
        <Icon name="flame" className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-xl font-bold leading-none text-ember-400">
          {currentStreak}
          <span className="ml-1 text-xs font-semibold uppercase tracking-widest text-parchment-300/60">
            day{currentStreak === 1 ? '' : 's'}
          </span>
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-parchment-300/50">
          Best: {longestStreak} day{longestStreak === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
}
