export default function StreakTracker({ currentStreak, longestStreak }) {
  const isActive = currentStreak > 0;

  return (
    <div
      className="parchment-card flex items-center gap-3 px-4 py-3"
      aria-label={`Current streak: ${currentStreak} days. Longest streak: ${longestStreak} days.`}
    >
      <span
        aria-hidden="true"
        className={`text-2xl ${isActive ? 'animate-flicker' : 'grayscale opacity-40'}`}
      >
        🔥
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
